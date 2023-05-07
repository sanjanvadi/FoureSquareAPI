import React, {useState} from 'react';
import '../../App.css';
import {useMutation} from '@apollo/client';
import ReactModal from 'react-modal';

//Import the file where my query constants are defined
import queries from '../../queries';

//For react-modal
ReactModal.setAppElement('#root');
const customStyles = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
    width: '40%',
    border: '1px solid #28547a',
    borderRadius: '4px'
  }
};

function DeleteLocation(props) {
  const [showDeleteModal, setShowDeleteModal] = useState(props.isOpen);
  const [location, setLocation] = useState(props.deleteLocation);

  const [delLocation] = useMutation(queries.DEL_LOCATION, {
    update(cache, {data: {deleteLocation}}) {
      const {userPostedLocations} = cache.readQuery({
        query: queries.GET_MY_LOCATIONS
      });
      cache.writeQuery({
        query: queries.GET_MY_LOCATIONS,
        data: {
          userPostedLocations: userPostedLocations.filter((e) => e.id !== location.id)
        }
      });
    }});

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setLocation(null);
    props.handleClose();
  };

  return (
    <div>
      {/*Delete Employee Modal */}
      <ReactModal
        name='deleteModal'
        isOpen={showDeleteModal}
        contentLabel='Delete Location'
        style={customStyles}
      >
        {/*Here we set up the mutation, since I want the data on the page to update
				after I have added someone, I need to update the cache. If not then
				I need to refresh the page to see the data updated 

				See: https://www.apollographql.com/docs/react/essentials/mutations for more
				information on Mutations
			*/}
        <div>
          <p>
            Are you sure you want to delete {location.name}?
          </p>

          <form
            className='form'
            id='delete-employee'
            onSubmit={(e) => {
              e.preventDefault();
              delLocation({
                variables: {
                  id: location.id
                }
              });
              setShowDeleteModal(false);

              alert('Location Deleted');
              props.handleClose();
            }}
          >
            <br />
            <br />
            <button className='button add-button' type='submit'>
              Delete Location
            </button>
          </form>
        </div>

        <br />
        <br />
        <button
          className='button cancel-button'
          onClick={handleCloseDeleteModal}
        >
          Cancel
        </button>
      </ReactModal>
    </div>
  );
}

export default DeleteLocation;
