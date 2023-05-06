import gql from "graphql-tag";

const GET_LOCATIONS = gql`
query locationsPosts($pageNum:Int!){
    locationPosts(pageNum:$pageNum) {
      id
      image
      name
      address
      liked
      userPosted
      distance
    }
  }
`;

const GET_LIKED_LOCATIONS = gql`
      query{
        likedLocations{
            id
            image
            name
            address
            liked
            userPosted
            distance
        }
      }
`;

const GET_MY_LOCATIONS = gql`
      query{
        userPostedLocations{
            id
            image
            name
            address
            liked
            userPosted
            distance
        }
      }
`;

const GET_TOP_DISTANCES = gql`
      query{
        getTopTenClosestLocations{
            id
            image
            name
            address
            liked
            userPosted
            distance
        }
      }
`

const ADD_LOCATION = gql`
      mutation createLocation(
        $image: String!
        $name: String!
        $address: String!
      ){
        uploadLocation(
            image: $image
            name: $name
            address: $address
        ){
            id
            image
            name
            address
            liked
            userPosted
            distance
        }
      }
`;

const EDIT_LOCATION = gql`
      mutation editLocation(
        $id: ID!
        $image: String
        $name: String
        $address: String
        $userPosted: Boolean
        $liked: Boolean
        $distance:Int
      ){
        updateLocation(
            id: $id
            image: $image
            name: $name
            address: $address
            userPosted: $userPosted
            liked: $liked
            distance: $distance
        ){
            id
            image
            name
            address
            liked
            userPosted
            distance
        }
      }
`;

const DEL_LOCATION=gql`
      mutation delLocation($id:ID!){
        deleteLocation(id:$id){
            id
            image
            name
            address
            liked
            userPosted
            distance
        }
      }
`;

let exported={
    GET_LOCATIONS,
    GET_LIKED_LOCATIONS,
    GET_MY_LOCATIONS,
    ADD_LOCATION,
    EDIT_LOCATION,
    DEL_LOCATION,
    GET_TOP_DISTANCES
};

export default exported;