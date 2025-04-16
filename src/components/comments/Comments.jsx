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
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingText, setEditingText] = useState("");

  const queryClient = useQueryClient();

  const { isLoading, error, data } = useQuery({
    queryKey: ["comments", postId],
    queryFn: async () => {
      const res = await makeRequest.get(`/comments?postId=${postId}`);
      return res.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (newComment) =>
      await makeRequest.post("/comments", newComment),
    onSuccess: () => {
      queryClient.invalidateQueries(["comments", postId]);
      setDesc("");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (commentId) =>
      await makeRequest.delete(`/comments/${commentId}`),
    onSuccess: () => {
      queryClient.invalidateQueries(["comments", postId]);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ commentId, desc }) =>
      await makeRequest.put(`/comments/${commentId}`, { desc }),
    onSuccess: () => {
      queryClient.invalidateQueries(["comments", postId]);
      setEditingCommentId(null);
    },
  });

  const handleSend = (e) => {
    e.preventDefault();
    if (!desc.trim()) return;
    createMutation.mutate({ desc, postId });
  };

  const handleDelete = (commentId) => {
    deleteMutation.mutate(commentId);
    setActiveMenuId(null);
  };

  const handleUpdate = (commentId, currentDesc) => {
    setEditingCommentId(commentId);
    setEditingText(currentDesc);
    setActiveMenuId(null);
  };

  const handleSaveUpdate = (commentId) => {
    if (editingText.trim()) {
      updateMutation.mutate({ commentId, desc: editingText });
    }
  };

  return (
    <div className="comments">
      {/* Write a comment */}
      <div className="write">
        <img
          src={currentUser.profilePic}
          alt="avatar"
          onError={(e) => (e.target.src = "/default-avatar.png")}
        />
        <input
          type="text"
          placeholder="Write a comment"
          onChange={(e) => setDesc(e.target.value)}
          value={desc}
        />
        <button onClick={handleSend}>Send</button>
      </div>

      {/* Comment list */}
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

              {editingCommentId === comment.id ? (
                <div className="edit-box">
                  <input
                    type="text"
                    value={editingText}
                    onChange={(e) => setEditingText(e.target.value)}
                  />
                  <button onClick={() => handleSaveUpdate(comment.id)}>
                    Save
                  </button>
                </div>
              ) : (
                <p>{comment.desc}</p>
              )}
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
                  <div className="comment-menu">
                    <button onClick={() => handleUpdate(comment.id, comment.desc)}>
                      Update
                    </button>
                    <button onClick={() => handleDelete(comment.id)}>
                      Delete
                    </button>
                  </div>
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
