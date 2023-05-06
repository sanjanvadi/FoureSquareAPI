import React, {useEffect, useState} from 'react';
import '../App.css';
import { useMutation, useQuery} from '@apollo/client';
import queries from '../queries';
import noImage from '../img/download.jpeg'
import DeleteLocation from './modals/DeleteLocation';
import { Card, CardContent, CardHeader, CardMedia, Grid, Typography } from '@mui/material';
import AddLocModal from './modals/AddLocModal';


function Locations(props){
    let card;
    let [pageNum,setPageNum] = useState(1);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteLocation, setDeleteLocation] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [pollInterval,setPollInterval] =useState(null);
    let query=null;
    if (props.mode === 'likes') {
        query = queries.GET_LIKED_LOCATIONS;
    } else if (props.mode === 'myLocations') {
        query = queries.GET_MY_LOCATIONS;
    } else {
        query = queries.GET_LOCATIONS;
    }
    useEffect(()=>{
        if (props.mode === 'likes') {
            setPollInterval(50);
        } else if (props.mode === 'myLocations') {
            setPollInterval(50);
        } else {
            setPollInterval(0);
        }
    },[props.mode])

    const { loading,error,data,refetch } = useQuery(query, {
        variables: { pageNum },
        fetchPolicy: 'cache-and-network',
        pollInterval:pollInterval
      });
    const [LikeUnlikeLocation] = useMutation(queries.EDIT_LOCATION);

    const handleOpenDeleteModal = (loc) => {
        setShowDeleteModal(true);
        setDeleteLocation(loc);
      };
    const handleOpenAddModal = () => {
    setShowAddModal(true);
    };
    const handleCloseModals = () => {
        setShowDeleteModal(false);
        setShowAddModal(false);
      };
    if(loading && !data){
        return(
            <div>
				<h2 className='title'>Loading....</h2>
			</div>
        );
    }
    if(error){
        return(
            <div>
                <p className="venueTitle">Error : {error.message}</p>
            </div>
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
                        sx={{objectFit: "contain" }}
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
                                refetch()
                            }
                            }>{loc.liked?"Unlike":"Like"}</button>

                            {props.mode==="myLocations"&&loc.userPosted?<button className='button'onClick={() => {handleOpenDeleteModal(loc)}}>Delete Location</button>:<span></span>}
                        </Typography>
                    </CardContent>
                    </div>
				</Card>
			</Grid>          
        )
    }
    let locations=null;
    if(data){
        if(props.mode==="likes"){
            locations = data.likedLocations;
        }
        else if(props.mode==="myLocations"){
            locations = data.userPostedLocations;
        }
        else{
            locations = data.locationPosts;
        }
    }

    if(locations.length!==0){
        card = locations && locations.map((loc)=>{
            return buildCard(loc);
        })
        return(
            <div>
                <br/>
                {props.mode==="locations"?<span className='heading'>Locations</span>:<span></span>}
                {props.mode==="myLocations"?<span className='heading'>My Locations</span>:<span></span>}
                {props.mode==="likes"?<span className='heading'>Liked Locations</span>:<span></span>}
                <br/>
                {props.mode==="myLocations"?<button className='tickets'onClick={handleOpenAddModal}>Add Location</button>:<span></span>}
                <br/>
                <br/>
                <Grid container justifyContent="center" className='grid' spacing={5}>
                    {card}
                </Grid>

                {/*Add Employee Modal */}
                {showAddModal && showAddModal && (
                <AddLocModal
                    isOpen={showAddModal}
                    handleClose={handleCloseModals}
                />
                )}

                {showDeleteModal && showDeleteModal && (
                <DeleteLocation
                    isOpen={showDeleteModal}
                    handleClose={handleCloseModals}
                    deleteLocation={deleteLocation}
                />
                )}
                <br/>
                {props.mode==="locations"&&pageNum<5&&pageNum>0?<button className='tickets' onClick={()=>{
                    setPageNum(parseInt(pageNum+1));
                    refetch({pageNum:parseInt(pageNum+1)});
                }}>Get More...</button>:<span></span>}
            </div>
        )
    }
    else if(!loading && locations.length===0){
        return(
            <div>
                <br/>
                {props.mode==="locations"?<span className='heading'>Locations</span>:<span></span>}
                {props.mode==="myLocations"?<span className='heading'>My Locations</span>:<span></span>}
                {props.mode==="likes"?<span className='heading'>Liked Locations</span>:<span></span>}
                <br/>
                <p className='heading'>Hmm..... seems like there are no locations here.</p>
                <br/>
                {props.mode==="myLocations"?<button className='tickets'onClick={handleOpenAddModal}>Add Location</button>:<span></span>}
                {showAddModal && showAddModal && (
                <AddLocModal
                    isOpen={showAddModal}
                    handleClose={handleCloseModals}
                />
                )}
            </div>
        )
    }
}

export default Locations;