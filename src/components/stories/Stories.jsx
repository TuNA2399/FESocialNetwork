import "./stories.scss";
import { AuthContext } from "../../context/authContext";
import { useState, useContext } from "react";
import { makeRequest } from "../../axios";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

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
      const formData = new FormData();
      formData.append("file", file);
      const res = await makeRequest.post("/upload", formData);
      return res.data;
    } catch (err) {
      console.log(err);
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
      }
    }
  };

  return (
    <div className="stories">
      <div className="story">
        <img
          src={
            currentUser.profilePic
          }
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
              src={`/upload/${story.img}`}
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
