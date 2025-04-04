import { useContext, useState } from "react";
import "./comments.scss";
import { AuthContext } from "../../context/authContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { makeRequest } from "../../axios";
import moment from "moment";

const Comments = ({ postId }) => {
  const { currentUser } = useContext(AuthContext);
  const [desc, setDesc] = useState("");

  const { isLoading, error, data } = useQuery({
    queryKey: ["comments"],
    queryFn: async () => {
      const res = await makeRequest.get("/comments?postId=" + postId);
      return res.data;
    }
  });

  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (newComment) => {
      const res = await makeRequest.post("/comments", newComment);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["comments"])
    },
  })

  const handleClick = async (e) => {
    e.preventDefault();
    mutation.mutate({ desc, postId })
    setDesc("");
  }

  return (
    <div className="comments">
      <div className="write">
        <img
          src={currentUser.profilePic ? `/upload/${currentUser.profilePic}` : "/upload/tuna.png"}
          alt="avt"
          onError={(e) => (e.target.src = "")}
        />
        <input type="text" placeholder="Write a comment" onChange={(e) => setDesc(e.target.value)} value={desc} />
        <button onClick={handleClick}>Send</button>
      </div>
      {isLoading
        ? "loading"
        : data.map((comment) => (
          <div className="comment" key={comment.div}>
            <img
              src={comment.profilePic ? `/upload/${comment.profilePic}` : "/upload/tuna.png"}
              alt="cmt"
              onError={(e) => (e.target.src = "")}
            />
            <div className="info">
              <span>{comment.name}</span>
              <p>{comment.desc}</p>
            </div>
            <span className="date">{moment(comment.createdAt).fromNow()}</span>
          </div>
        ))}
    </div>
  );
};

export default Comments;
