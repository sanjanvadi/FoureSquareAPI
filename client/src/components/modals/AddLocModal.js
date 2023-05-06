import React, { useState } from "react";
import "../../App.css";
import { useMutation } from "@apollo/client";
import ReactModal from "react-modal";
//Import the file where my query constants are defined
import queries from "../../queries";
import axios from "axios";

//For react-modal
ReactModal.setAppElement("#root");
const customStyles = {
  content: {
    top: "50%",
    left: "50%",
    right: "auto",
    bottom: "auto",
    marginRight: "-50%",
    transform: "translate(-50%, -50%)",
    width: "40%",
    height: "35%",
    border: "1px solid #28547a",
    borderRadius: "4px",
  },
};

function AddLocModal(props) {
  const [showAddModal, setshowAddModal] = useState(props.isOpen);
  let image, name, address;
  const [addLocation] = useMutation(queries.ADD_LOCATION, {
    update(cache, { data: { uploadLocation } }) {
      const { userPostedLocations } = cache.readQuery({
        query: queries.GET_MY_LOCATIONS,
      });
      cache.writeQuery({
        query: queries.GET_MY_LOCATIONS,
        data: {
          userPostedLocations: userPostedLocations.concat([uploadLocation]),
        },
      });
    },
  });

  const handleCloseAddModal = () => {
    setshowAddModal(false);
    props.handleClose();
  };

  return (
    <div>
      {/*Add Location Modal */}
      <ReactModal
        name="Add Modal"
        isOpen={showAddModal}
        contentLabel="Delete Location"
        style={customStyles}
      >
        {/*Here we set up the mutation, since I want the data on the page to update
				after I have added someone, I need to update the cache. If not then
				I need to refresh the page to see the data updated 

				See: https://www.apollographql.com/docs/react/essentials/mutations for more
				information on Mutations
			*/}
        <div>
          <p className="title">Provide image urls that are already on the internet</p>
            <br/>
          <form
            onSubmit={async (e) => {
              try {
                e.preventDefault();
                // eslint-disable-next-line
                if(!((/^[0-9]{1,6}[a-zA-Z, \.]+[0-9]*[a-zA-Z, \.]*$/).test(address.value))){
                    // eslint-disable-next-line
                    throw "Invalid address";
                }
                if(image.value){
                    const imgExists = await axios.get(image.value);
                    if(!imgExists){
                        // eslint-disable-next-line
                        throw "Image does not Exists";
                    }
                }
                addLocation({
                  variables: {
                    image: image.value,
                    name: name.value,
                    address: address.value,
                  },
                });
                image.value = "";
                name.value = "";
                address.value = "";
                alert("Location Added");
                props.handleClose();
              } catch (error) {
                alert(error);
              }
            }}
          >
            <div>
              <label className="label title">
                Image:
                <input
                  ref={(node) => {
                    image = node;
                  }}
                  required
                  autoFocus={true}
                />
              </label>
              <br />
              <br />
              <label className="label title">
                Name:
                <input
                  ref={(node) => {
                    name = node;
                  }}
                  required
                />
              </label>
              <br />
              <br />
              <label className="label title">
                Address:
                <input
                  ref={(node) => {
                    address = node;
                  }}
                  required
                />
              </label>

              <button className="button add-button" type="submit">
                Add Location
              </button>
            </div>
          </form>
        </div>

        <br />
        <br />
        <button className="button cancel-button" onClick={handleCloseAddModal}>
          Cancel
        </button>
      </ReactModal>
    </div>
  );
}

export default AddLocModal;
