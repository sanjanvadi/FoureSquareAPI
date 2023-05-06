import React from "react";
import '../App.css';
import { useMutation, useQuery} from '@apollo/client';
import queries from '../queries';
import noImage from '../img/download.jpeg'
import { Card, CardContent, CardHeader, CardMedia, Grid, Typography } from '@mui/material';

function Distances(){
    let card;
    const { loading,error,data,refetch } = useQuery(queries.GET_TOP_DISTANCES,{
        pollInterval: 5,
    });
    const [LikeUnlikeLocation] = useMutation(queries.EDIT_LOCATION);
    if(loading && !data){
        return(
            <p className='loading'>Loading . . .</p>
        );
    }
    if(error){
        return(
            <p className='error'>Error : {error.message}</p>
        );
    }

    const buildCard=(loc)=>{
        return(
            <Grid item xs={12} sm={5} md={4} lg={3} xl={3} key={loc.id}>
                <Card className='card' variant='outlined'>
                <div>
                    <CardHeader className='titleHead' variant='h5' title={loc.name}
                    />
                    <CardMedia
                        className='media'
                        component='img'
                        image={loc.image==="N/A" ? noImage : loc.image}
                        title='Location image'
                    />
                    <CardContent>
                        <Typography variant='body1' component='span'>
                            Address: {loc.address?<span>{loc.address}</span>:<span>N/A</span>}
                            <br/>
                            Distance: {loc.distance?<span>{loc.distance} Mile</span>:<span>N/A</span>}
                            <br/>
                        <button className='tickets' onClick={(e)=>{
                            e.preventDefault();
                            if (loc.liked===true) {
                                LikeUnlikeLocation({
                                    variables:{
                                        id:loc.id,
                                        image:loc.image,
                                        name:loc.name,
                                        address:loc.address,
                                        userPosted:loc.userPosted,
                                        liked:false,
                                        distance:loc.distance
                                    }
                                });
                            }
                            else if(loc.liked===false){
                                LikeUnlikeLocation({
                                    variables:{
                                        id:loc.id,
                                        image:loc.image,
                                        name:loc.name,
                                        address:loc.address,
                                        userPosted:loc.userPosted,
                                        liked:true,
                                        distance:loc.distance
                                    }
                                });
                            }
                            refetch();
                        }
                        }>{loc.liked?"Unlike":"Like"}</button>
                    </Typography>
                </CardContent>
                </div>
            </Card>
        </Grid> 
        )
    }

    if(data && data.getTopTenClosestLocations.length!==0){
        let total=0;
        let locations=data.getTopTenClosestLocations;
        card = locations && locations.map((loc)=>{
            total = total+loc.distance;
            return buildCard(loc);
        })
        return(
            <div>
                <p className='heading'>Distances of Liked Locations</p>
                {total<50?<p className="tile">Hooray! You are a <span className="label">Local</span><br/>you have travelled a total of {total} Miles.</p>:<p className="tile">Hooray! You are a <span className="label">Traveller</span><br/>you have travelled a total of {total} Miles.</p>}
                <Grid container justifyContent="center" className='grid' spacing={5}>
                    {card}
                </Grid>
            </div>
        )
    }
    else{
        return(
            <div>
                <p className='heading'>Distances of Liked Locations</p>
                <p className='heading'>Hmm..... seems like there are no locations here.</p>
            </div>
        )
    }
}

export default Distances;