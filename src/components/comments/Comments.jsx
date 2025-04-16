import { useContext, useState } from "react";
import "./comments.scss";
import { AuthContext } from "../../context/authContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { makeRequest } from "../../axios";
import moment from "moment";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";

const Comments = ({ postId }) => {
  const { currentUser } = useContext(AuthContext);
  const [desc, setDesc] = useState("");
  const [activeMenuId, setActiveMenuId] = useState(null);

  const queryClient = useQueryClient();

  const { isLoading, error, data } = useQuery({
    queryKey: ["comments", postId],
    queryFn: async () => {
      const res = await makeRequest.get("/comments?postId=" + postId);
      return res.data;
    },
  });

  const mutation = useMutation({
    mutationFn: async (newComment) => {
      const res = await makeRequest.post("/comments", newComment);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["comments", postId]);
      setDesc("");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (commentId) => {
      return await makeRequest.delete(`/comments/${commentId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["comments", postId]);
    },
  });

  const handleSend = (e) => {
    e.preventDefault();
    if (!desc.trim()) return;
    mutation.mutate({ desc, postId });
  };

  const handleDelete = (commentId) => {
    deleteMutation.mutate(commentId);
    setActiveMenuId(null);
  };

  return (
    <div className="comments">
      <div className="write">
        <img
          src={currentUser.profilePic}
          alt="avatar"
          onError={(e) => (e.target.src = "")}
        />
        <input
          type="text"
          placeholder="Write a comment"
          onChange={(e) => setDesc(e.target.value)}
          value={desc}
        />
        <button onClick={handleSend}>Send</button>
      </div>

      {isLoading ? (
        <p>Loading...</p>
      ) : error ? (
        <p>Error loading comments.</p>
      ) : (
        data?.map((comment) => (
          <div className="comment" key={comment.id}>
            <img
              src={comment.profilePic || "/default-avatar.png"}
              alt="comment"
              onError={(e) => (e.target.src = "/default-avatar.png")}
            />
            <div className="info">
              <span>{comment.name}</span>
              <p>{comment.desc}</p>
            </div>
            <span className="date">{moment(comment.createdAt).fromNow()}</span>

            {comment.userId === currentUser.id && (
              <>
                <MoreHorizIcon
                  className="menu-icon"
                  onClick={() =>
                    setActiveMenuId(
                      activeMenuId === comment.id ? null : comment.id
                    )
                  }
                />
                {activeMenuId === comment.id && (
                  <button className="delete-btn" onClick={() => handleDelete(comment.id)}>
                    Delete
                  </button>
                )}
              </>
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default Comments;
