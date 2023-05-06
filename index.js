import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { v4 as uuid } from 'uuid';
import { GraphQLError } from 'graphql';
import fetch from 'node-fetch';
import redis from 'redis';
import axios from 'axios';
const client = redis.createClient();
client.connect().then(() => {});

// A schema is a collection of type definitions (hence "typeDefs")
// that together define the "shape" of queries that are executed against
// your data.
const typeDefs = `#graphql
type Location {
    id: ID!
    image: String!
    name: String!
    address: String
    userPosted: Boolean!
    liked: Boolean!
    distance:Int!
}

type Query {
    locationPosts(pageNum: Int):[Location]
    likedLocations:[Location]
    userPostedLocations:[Location]
    getTopTenClosestLocations:[Location]
}

type Mutation{
    uploadLocation(
        image: String!
        name: String!
        address: String!
        ):Location
    updateLocation(
        id: ID!
        image: String
        name: String
        address: String
        userPosted: Boolean
        liked: Boolean
        distance:Int
        ):Location
    deleteLocation(id: ID!):Location
}
`;

// getDistanceFromLatLonInMi : https://stackoverflow.com/questions/18883601/function-to-calculate-distance-between-two-coordinates
    
function getDistanceFromLatLonInMi(lat1,lon1,lat2, lon2) {
    var R = 3958.8; // Radius of the earth in Miles
    var dLat = deg2rad(lat2-lat1);  // deg2rad below
    var dLon = deg2rad(lon2-lon1); 
    var a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
        Math.sin(dLon/2) * Math.sin(dLon/2)
        ; 
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    var d = R * c; // Distance in Miles
    return Math.round(d);
    }

    function deg2rad(deg) {
    return deg * (Math.PI/180)
    }

// Resolvers define the technique for fetching the types defined in the
// schema. This resolver retrieves books from the "books" array above.
const resolvers = {
    Query:{
        locationPosts: async(_,args)=>{

            let limit = args.pageNum * 10 || 10;
            if(limit<0||limit>50){
                throw new GraphQLError('Limit out of bounds',{
                    extensions:{
                        code:'BAD_USER_INPUT'
                    }
                })
            }
            const options = {
                method: 'GET',
                headers: {
                    accept: 'application/json',
                    Authorization: 'fsq30GgIDGHLs+inGebgGRCeW4tIZz0N8JAvPeltkZ3kIuw='
                }
                };
            let output;
            await fetch(`https://api.foursquare.com/v3/places/search?limit=${limit}`, options)
                .then(response => response.json())
                .then(response => output=response)
                .catch(err => {throw new GraphQLError(err,{
                    extensions:{
                        code:'INTERNAL_SERVER_ERROR'
                    }
                })});
            let lat1 = output.context.geo_bounds.circle.center.latitude;
            let lon1 =output.context.geo_bounds.circle.center.longitude;

            let data=output.results.map(async (loc)=>{
                let image;
                let distance = getDistanceFromLatLonInMi(lat1,lon1,loc.geocodes.main.latitude,loc.geocodes.main.longitude)
                const locExInLikeLoc = await client.hExists("likedLoc",loc.fsq_id.toString());
                await fetch(`https://api.foursquare.com/v3/places/${loc.fsq_id}/photos`, options)
                .then(response => response.json())
                .then(response => {
                    if(response.length!=0){
                    image=response[0].prefix+"200x200"+response[0].suffix
                    }
                    else{
                        image="N/A";
                    }})   
                .catch(err => {throw new GraphQLError(err,{
                    extensions:{
                        code:'INTERNAL_SERVER_ERROR'
                    }
                })});
                if(locExInLikeLoc){
                    return {
                        id:loc.fsq_id,
                        image:image,
                        name:loc.name,
                        address:loc.location.formatted_address,
                        userPosted: false,
                        liked: true,
                        distance:distance
                    }
                }
                else{
                    return {
                        id:loc.fsq_id,
                        image:image,
                        name:loc.name,
                        address:loc.location.formatted_address,
                        userPosted: false,
                        liked: false,
                        distance:distance
                    }
                }
            })
            return data;
        },
        likedLocations: async()=>{
            let likedLocs =  await client.hVals("likedLoc");
            let data=likedLocs.map(loc=>{
                let objLoc = JSON.parse(loc);
                return objLoc
            })
            return data;
        },
        userPostedLocations:async()=>{
            let myLocs =  await client.hVals("myLoc");
            let data=myLocs.map(loc=>{
                let objLoc = JSON.parse(loc);
                return objLoc
            })
            return data;
        },
        getTopTenClosestLocations:async()=>{
            let dLocs  =await client.zRange("distanceSet", 0, 9);
            let data=dLocs.map(loc=>{
                let objLoc = JSON.parse(loc);
                return objLoc
            })
            return data;
        }
    },

    Mutation:{
        uploadLocation:async (_,args)=>{

            if(!((/^[0-9]{1,6}[a-zA-Z, \.]+[0-9]*[a-zA-Z, \.]*$/).test(args.address))){
                throw new GraphQLError('Invalid Address',{
                    code:'BAD_USER_INPUT'
                });
            }
            if(args.image){
                const imgExists = await axios.get(args.image);
                if(!imgExists){
                    throw "Image does not Exists";
                }
            }

            const options = {
                method: 'GET',
                headers: {
                    accept: 'application/json',
                    Authorization: 'fsq30GgIDGHLs+inGebgGRCeW4tIZz0N8JAvPeltkZ3kIuw='
                }
                };
            let value;
            await fetch(`https://api.foursquare.com/v3/places/search`, options)
                .then(response => response.json())
                .then(response => value=response)
                .catch(err => {throw new GraphQLError(err,{
                    extensions:{
                        code:'INTERNAL_SERVER_ERROR'
                    }
                })});
            let lat1 = value.context.geo_bounds.circle.center.latitude;
            let lon1 =value.context.geo_bounds.circle.center.longitude;
            let output;
            let requestOptions = {
                method: 'GET',
                };
                
            await fetch(`https://api.geoapify.com/v1/geocode/search?text=${args.address}&filter=countrycode:us&apiKey=2afa7daefa044864a1348628ee51df98`, requestOptions)
                .then(response => response.json())
                .then(result => output=result.features[0].properties)
                .catch(error => {throw new GraphQLError(error,{
                    extensions:{
                        code:'INTERNAL_SERVER_ERROR'
                    }
                })});
            let lat2 = output.lat;
            let lon2 = output.lon;

            let distance = getDistanceFromLatLonInMi(lat1,lon1,lat2,lon2);

            const newLocation = {
                id:uuid(),
                image:args.image,
                name:args.name,
                address:output.formatted.replace(', United States of America',''),
                userPosted:true,
                liked:false,
                distance:distance
            }
            
            const stored = await client.hSet('myLoc',newLocation.id.toString(),JSON.stringify(newLocation));
            return newLocation;
        },

        updateLocation:async (_,args)=>{
            const locExInMyLoc = await client.hExists("myLoc",args.id.toString());
            const locExInLikedLoc = await client.hExists("likedLoc",args.id.toString());
            let loc;
            if(locExInMyLoc){
                loc = await client.hGet("myLoc",args.id.toString())
                loc = JSON.parse(loc);
                if(loc.userPosted==true){
                    if(args.image){
                        loc.image = args.image;
                    }
                    if(args.name){
                        loc.name = args.name;
                    }
                    if(args.address){
                        loc.address = args.address;
                    }
                    loc.distance = args.distance;
                    loc.liked=args.liked;
                    loc.userPosted=args.userPosted;
                
                    const deletedFromMyloc = await client.hDel("myLoc",args.id.toString())
                    if(deletedFromMyloc){
                        const newLocAdded = await client.hSet("myLoc",args.id.toString(),JSON.stringify(loc));
                    }
                }
            }
            if(locExInLikedLoc){
                loc = await client.hGet("likedLoc",args.id.toString());
                loc = JSON.parse(loc);
                if(args.liked==false&&loc.liked==true){
                    const del = await client.hDel("likedLoc",args.id.toString());
                    const delFromDSet = await client.zRem("distanceSet",JSON.stringify(loc));
                }
                if(args.userPosted==true && args.liked==true){
                    if(args.image){
                        loc.image = args.image;
                    }
                    if(args.name){
                        loc.name = args.name;
                    }
                    if(args.address){
                        loc.address = args.address;
                    }
                    loc.distance = args.distance;
                    loc.liked=args.liked;
                    loc.userPosted=args.userPosted;
                    const del = await client.hDel("likedLoc",args.id.toString());
                    const delFromDSet = await client.zRem("distanceSet",JSON.stringify(loc));
                    
                    if(del && delFromDSet){
                        const locAdded = await client.hSet("likedLoc",args.id.toString(),JSON.stringify(loc));
                        const locAddedinDSet=await client.zAdd("distanceSet",{score:args.distance,value:JSON.stringify(loc)});
                    }
                }
            }
            if(!locExInLikedLoc){
                if(args.liked==true){
                    loc={
                        id:args.id,
                        image:args.image,
                        name:args.name,
                        address:args.address,
                        userPosted:args.userPosted,
                        liked:args.liked,
                        distance:args.distance
                    }
                    const newLocAdded = await client.hSet("likedLoc",args.id.toString(),JSON.stringify(loc));
                    const locAddedinDSet=await client.zAdd("distanceSet",{score:args.distance,value:JSON.stringify(loc)});
                }
            }
            return loc;
        },

        deleteLocation:async(_,args)=>{
            const locExInMyLoc = await client.hExists("myLoc",args.id.toString());
            const locExInLikedLoc = await client.hExists("likedLoc",args.id.toString());
            let loc
            if(locExInMyLoc){
                loc = await client.hGet("myLoc",args.id.toString());
                await client.hDel("myLoc",args.id.toString());
            }
            if(locExInLikedLoc){
                loc = await client.hDel("likedLoc",args.id.toString());
                await client.zRem("distanceSet",loc);
            }

            loc = JSON.parse(loc);
            return loc;
        }
    }
};

// The ApolloServer constructor requires two parameters: your schema
// definition and your set of resolvers.
const server = new ApolloServer({
  typeDefs,
  resolvers,
});

// Passing an ApolloServer instance to the `startStandaloneServer` function:
//  1. creates an Express app
//  2. installs your ApolloServer instance as middleware
//  3. prepares your app to handle incoming requests
const { url } = await startStandaloneServer(server, { listen: { port: 4000 } });

console.log(`🚀 Server listening at: ${url}`);