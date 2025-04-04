import "./post.scss";
import FavoriteBorderOutlinedIcon from "@mui/icons-material/FavoriteBorderOutlined";
import FavoriteOutlinedIcon from "@mui/icons-material/FavoriteOutlined";
import TextsmsOutlinedIcon from "@mui/icons-material/TextsmsOutlined";
import ShareOutlinedIcon from "@mui/icons-material/ShareOutlined";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import { Link } from "react-router-dom";
import Comments from "../comments/Comments";
import { useState, useContext } from "react";
import moment from "moment";
import { makeRequest } from "../../axios";
import { AuthContext } from "../../context/authContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";


const Post = ({ post }) => {
  const [commentOpen, setCommentOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { currentUser } = useContext(AuthContext);


  const { isLoading, error, data } = useQuery({
    queryKey: ["likes", post.id],
    queryFn: async () => {
      const res = await makeRequest.get("/likes?postId=" + post.id);
      return res.data;
    }
  });

  const queryClient = useQueryClient();

  const mutationLike = useMutation({
    mutationFn: async (postId) => {
      const res = await makeRequest.post("/likes", { postId });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["likes"])
    },
  })

  const mutationDislike = useMutation({
    mutationFn: async (postId) => {
      return await makeRequest.delete("/likes?postId=" + postId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["posts"]);
    },
  })

  const handleLike = (e) => {
    e.preventDefault();
    if (data.includes(currentUser.id)) return mutationDislike.mutate(post.id);
    return mutationLike.mutate(post.id)
  };

  const deleteMutation = useMutation({
    mutationFn: async (postId) => {
      console.log("Deleting post with ID: ", postId);
      return await makeRequest.delete(`/posts/${postId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["posts"]);
    },
  });

  const handleDelete = () => {
    console.log("Post ID being deleted:", post.id);
    deleteMutation.mutate(post.id);
  };

  const { isLoading: isCommentLoading, error: commentErr, data: commentData } = useQuery({
    queryKey: ["commentsNumber", post.id],
    queryFn: async () => {
      const res = await makeRequest.get("/comments?postId=" + post.id);
      return res.data;
    }
  });

  if (isLoading) return <p>Loading...</p>;


  return (
    <div className="post">
      <div className="container">
        <div className="user">
          <div className="userInfo">
            <img
              src={post.profilePic ? `/upload/${post.profilePic}` : "https://via.placeholder.com/150"}
              alt="avt"
              onError={(e) => (e.target.src = "https://via.placeholder.com/150")}
            />
            <div className="details">
              <Link
                to={`/profile/${post.userId}`}
                style={{ textDecoration: "none", color: "inherit" }}
              >
                <span className="name">{post.name}</span>
              </Link>
              <span className="date">{moment(post.createdAt).fromNow()}</span>
            </div>
          </div>
          <MoreHorizIcon onClick={() => setMenuOpen(!menuOpen)} />
          {menuOpen && post.userId === currentUser.id && (
            <button onClick={handleDelete}>Delete</button>
          )}
        </div>
        <div className="content">
          <p>{post.desc}</p>
          <img
            src={post.img ? `/upload/${post.img}` : "https://via.placeholder.com/150"}
            alt="Post"
            onError={(e) => (e.target.src = "https://via.placeholder.com/150")}
          />
        </div>
        <div className="info">
          <div className="item">
            {(data.includes(currentUser.id))
              ? <FavoriteOutlinedIcon style={{ color: "red" }} onClick={handleLike} />
              : <FavoriteBorderOutlinedIcon onClick={handleLike} />
            }
            {data.length} Likes
          </div>

          <div className="item" onClick={() => setCommentOpen(!commentOpen)}>
            <TextsmsOutlinedIcon />
            {isCommentLoading ? "Loading..." : `${commentData?.length || 0} Comments`}
          </div>
          <div className="item">
            <ShareOutlinedIcon />
            Share
          </div>
        </div>
        {commentOpen && <Comments postId={post.id} />}
      </div>
    </div>
  );
};

export default Post;
