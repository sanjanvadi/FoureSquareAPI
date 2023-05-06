import { useMutation } from "@apollo/client";
import queries from "../queries";
import { Link } from "react-router-dom";
import axios from "axios";

function AddLocation() {
  const [addLocation] = useMutation(queries.ADD_LOCATION);
  let image, name, address;
  return (
    <div>
      <p className="heading">Add a location</p>
      <p>Provide image urls that are already on the internet</p>
      <form
        className="form"
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
          } catch (error) {
            alert(error);
          }
        }}
      >
        <label className="label">
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
        <label className="label">
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
        <label className="label">
          Address:
          <input
            ref={(node) => {
              address = node;
            }}
            required
          />
        </label>
        <br />
        <br />
        <button className="tickets" type="submit">
          Add Location
        </button>
        <span className="space"></span>
        <Link to="/my-locations" className="ticket">
          Cancel
        </Link>
      </form>
    </div>
  );
}

export default AddLocation;
