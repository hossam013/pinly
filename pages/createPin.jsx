import { fetchingUser } from "../utils/fetchingUser";
import { useState } from "react";
import { AiOutlineCloudUpload } from "react-icons/ai";
import { MdDelete } from "react-icons/md";

import Spinner from "../components/spinner";
import { client } from "../pages/api/auth/client";
import { categories } from "../utils/data";
import { useRouter } from "next/router";
import ProtectedLink from "./../components/protectedLink";

const CreatePin = () => {
  const [title, setTitle] = useState("");
  const [about, setAbout] = useState("");
  // const [destination, setDestination] = useState("");
  const [loading, setLoading] = useState(false);
  const [fields, setFields] = useState(false);
  const [category, setCategory] = useState(null);
  const [imageAsset, setImageAsset] = useState(null);
  const [wrongImageType, setWrongImageType] = useState(false);

  const user = fetchingUser();
  let router = useRouter();

  const handleUploadImage = (e) => {
    let file = e.target.files[0];
    let { type, name } = file;

    if (
      type === "image/png" ||
      type === "image/svg" ||
      type === "image/jpeg" ||
      type === "image/gif" ||
      type === "image/tiff"
    ) {
      setWrongImageType(false);
      setLoading(true);

      client.assets
        .upload("image", file, {
          contentType: type,
          filename: name,
        })
        .then((document) => {
          setImageAsset(document);
          setLoading(false);
        })
        .catch((ex) => {
          console.error("upload error", ex);
        });
    } else {
      setWrongImageType(true);
    }
  };

  const savePin = () => {
    if (!user) {
      router.push("/login");
    }

    if (user && title && imageAsset?._id && category) {
      const document = {
        _type: "pin",
        title,
        about,
        image: {
          _type: "image",
          asset: {
            _type: "reference",
            _ref: imageAsset?._id,
          },
        },
        userId: user?._id,
        postedBy: {
          _type: "postedBy",
          _ref: user?._id,
        },
        category,
      };

      client.create(document).then(router.push("/"));
    } else {
      setFields(true);
    }
  };

  return (
    <div className="flex md:flex-col justify-center items-center mt-5 lg:h-4/5">
      <ProtectedLink />
      {fields && (
        <p className="text-red-500 mb-5 text-xl transition-all duration-150 ease-in">
          Please add all fields.
        </p>
      )}
      <div className="flex flex-col md:flex-row justify-center items-center bg-white lg:p-5 p-3 lg:w-4/5 w-full">
        <div className="bg-secondaryColor p-3 flex w-full min-w-fit">
          <div className="flex justify-center items-center flex-col border-2 border-dotted border-gray-300 p-3 w-full h-370">
            {loading && <Spinner />}
            {wrongImageType && <p>Wrong Image Type</p>}
            {!imageAsset ? (
              <label>
                <div className="flex flex-col items-center justify-center h-full">
                  <div className="flex flex-col justify-center items-center">
                    <p className="font-bold text-2xl">
                      <AiOutlineCloudUpload />
                    </p>
                    <p className="text-lg">Upload</p>
                  </div>
                  <p className="mt-3 text-gray-400 flex self-end">
                    Less than 20MB
                  </p>
                </div>
                <input
                  type="file"
                  name="upload-image"
                  className="w-0 h-0"
                  onChange={handleUploadImage}
                />
              </label>
            ) : (
              <div className="relative h-full">
                <img
                  src={imageAsset?.url}
                  alt="uploaded-image"
                  className="h-full w-full"
                />
                <button
                  type="button"
                  onClick={() => setImageAsset(null)}
                  className="absolute bottom-3 right-3 p-3 rounded-full bg-white text-xl cursor-pointer outline-none hover:shadow-md transition-all duration-500 ease-in-out"
                >
                  <MdDelete />
                </button>
              </div>
            )}
          </div>
        </div>
        <div className="flex flex-1 flex-col gap-6 lg:pl-5 mt-5 w-full">
          {user && (
            <div className="flex gap-2 mt-2 mb-2 items-center bg-white rounded-lg">
              <img
                src={user.image}
                className="w-10 h-10 rounded-full"
                alt="user-profile"
              />
              <p className="font-bold">{user.name}</p>
            </div>
          )}
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Add Title"
            className="outline-none border-b-2 border-gray-200 p-2"
          />
          <input
            type="text"
            value={about}
            onChange={(e) => setAbout(e.target.value)}
            placeholder="What is this pin about?"
            className="outline-none border-b-2 border-gray-200 p-2"
          />
          {/* <input
            type="text"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            placeholder="Add a distenation link"
            className="outline-none border-b-2 border-gray-200 p-2"
          /> */}
          <div className="flex flex-col">
            <div>
              <p className="mb-2 font-semibold text:lg sm:text-xl">
                Choose Category
              </p>
              <select
                onChange={(e) => setCategory(e.target.value)}
                className="outline-none w-4/5 text-base border-b-2 border-gray-200 p-2 rounded-md cursor-pointer"
              >
                <option value="other" className="bg-white">
                  Select Category
                </option>
                {categories.map((categ) => (
                  <option
                    value={categ.name}
                    key={categ.name}
                    className="text-base border-0 outline-none capitalize bg-white text-black"
                  >
                    {categ.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex justify-end items-end mt-5">
              <button
                type="button"
                onClick={savePin}
                className="bg-red-500 text-white font-bold p-2 rounded-full w-28 outline-none"
              >
                Save Pin
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatePin;
