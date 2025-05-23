import "./profile.scss";
import FacebookTwoToneIcon from "@mui/icons-material/FacebookTwoTone";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import InstagramIcon from "@mui/icons-material/Instagram";
import PinterestIcon from "@mui/icons-material/Pinterest";
import TwitterIcon from "@mui/icons-material/Twitter";
import PlaceIcon from "@mui/icons-material/Place";
import LanguageIcon from "@mui/icons-material/Language";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import Posts from "../../components/posts/Posts"
import { makeRequest } from "../../axios";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "react-router-dom";
import { useContext, useState } from "react";
import { AuthContext } from "../../context/authContext";
import Update from "../../components/update/Update";


const Profile = () => {
  const [openUpdate, setOpenUpdate] = useState(false);

  const userId = useLocation().pathname.split("/")[2]
  const { currentUser } = useContext(AuthContext);

  const { isLoading, error, data } = useQuery({
    queryKey: ["user", userId],
    queryFn: async () => {
      const res = await makeRequest.get("/users/find/" + userId);
      return res.data;
    }
  });

  const { isLoading: relationshipLoading, data: relationshipData } = useQuery({
    queryKey: ["relationship", userId],
    queryFn: async () => {
      const res = await makeRequest.get("/relationships?followedUserId=" + userId);
      console.log(relationshipData);
      return res.data;
    }
  });
  const queryClient = useQueryClient();

  const mutationFollow = useMutation({
    mutationFn: async (followedUserId) => {
      const res = await makeRequest.post("/relationships", { followedUserId });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["relationships"])
    },
  })

  const mutationUnfollow = useMutation({
    mutationFn: async (followedUserId) => {
      return await makeRequest.delete("/relationships?followedUserId=" + followedUserId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["relationships"]);
    },
  })

  const handleFollow = (e) => {
    e.preventDefault();
    if (relationshipData.includes(currentUser.id)) return mutationUnfollow.mutate(userId);
    return mutationFollow.mutate(userId)
  };


  return (
    <div className="profile">
      {isLoading ? "Loading..." : <>
        <div className="images">
          <img
            src={data.coverPic}
            alt=""
            className="cover"
          />
          <img
            src={data.profilePic}
            alt=""
            className="profilePic"
          />
        </div>
        <div className="profileContainer">
          <div className="uInfo">
            <div className="left">
              <a href="http://facebook.com">
                <FacebookTwoToneIcon fontSize="large" />
              </a>
              <a href="http://facebook.com">
                <InstagramIcon fontSize="large" />
              </a>
              <a href="http://facebook.com">
                <TwitterIcon fontSize="large" />
              </a>
              <a href="http://facebook.com">
                <LinkedInIcon fontSize="large" />
              </a>
              <a href="http://facebook.com">
                <PinterestIcon fontSize="large" />
              </a>
            </div>
            <div className="center">
              <span>{data.name}</span>
              <div className="info">
                <div className="item">
                  <PlaceIcon />
                  <span>{data.city ? data.city : ""}</span>
                </div>
                <div className="item">
                  <LanguageIcon />
                  <span>{data.website ? data.website : ""}</span>
                </div>
              </div>
              {relationshipLoading ? "Loading..."
                : (data.id === currentUser.id
                  ? (<button onClick={() => setOpenUpdate(true)}>Update</button>)
                  : <button onClick={handleFollow}>{relationshipData.includes(currentUser.id) ? "Unfollow" : "Follow"}</button>)}
            </div>
            <div className="right">
              <EmailOutlinedIcon />
              <MoreVertIcon />
            </div>
          </div>
          <Posts userId={userId} />
        </div>
      </>}
      {openUpdate && <Update setOpenUpdate={setOpenUpdate} user={data} />}
    </div>
  );
};

export default Profile;
