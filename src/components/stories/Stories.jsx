import "./stories.scss";
import { AuthContext } from "../../context/authContext";
import { useState, useContext } from "react";
import { makeRequest } from "../../axios";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

const Stories = () => {
  const { currentUser } = useContext(AuthContext);
  const queryClient = useQueryClient();
  const [file, setFile] = useState(null);

  const { isLoading, error, data } = useQuery({
    queryKey: ["stories", currentUser?.id],
    queryFn: async () => {
      const res = await makeRequest.get("/stories");
      return res.data;
    },
  });

  const mutation = useMutation({
    mutationFn: async (newStory) => {
      const res = await makeRequest.post("/stories", newStory);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["stories"]);
    },
  });

  const upload = async (file) => {
    try {
      const signatureResponse = await makeRequest.get("/signature");
  
      const formData = new FormData();
      formData.append("file", file);
      formData.append("api_key", signatureResponse.data.apiKey);
      formData.append("timestamp", signatureResponse.data.timestamp);
      formData.append("signature", signatureResponse.data.signature);
      formData.append("folder", signatureResponse.data.folder);
      formData.append("upload_preset", signatureResponse.data.uploadPreset); // ✅ Add this line!
  
      const cloudinaryResponse = await axios.post(
        `https://api.cloudinary.com/v1_1/${signatureResponse.data.cloudName}/image/upload`,
        formData
      );
  
      return cloudinaryResponse.data.secure_url;
    } catch (err) {
      console.error("Error uploading to Cloudinary:", err.response?.data || err.message);
      return "";
    }
  };

  const handleFileChange = async (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);

    if (selectedFile) {
      const imgUrl = await upload(selectedFile);
      if (imgUrl) {
        mutation.mutate({ img: imgUrl });
        setFile(null);
      } else {
        console.error("Image upload failed, no URL returned");
      }
    }
  };

  return (
    <div className="stories">
      <div className="story">
        <img
          src={currentUser.profilePic}
          alt="story"
          onError={(e) => (e.target.src = "")}
        />
        <input
          type="file"
          id="storyFile"
          style={{ display: "none" }}
          onChange={handleFileChange}
        />
        <label htmlFor="storyFile">
          <div className="item clickable">
            <img src="your-upload-icon.png" alt="upload" />
            <span className="plus">+</span>
          </div>
        </label>
      </div>

      {isLoading ? (
        <p>Loading stories...</p>
      ) : error ? (
        <p>Something went wrong.</p>
      ) : (
        data?.map((story) => (
          <div className="story" key={story.id}>
            <img
              src={story.img}
              alt={story.name}
              onError={(e) => (e.target.src = "")}
            />
            <span>{story.name}</span>
          </div>
        ))
      )}
    </div>
  );
};

export default Stories;
