import Post from "../post/Post";
import "./posts.scss";
import { makeRequest } from "../../axios";
import { useQuery } from "@tanstack/react-query";
const Posts = ({ userId }) => {

  const { isLoading, error, data } = useQuery({
    queryKey: ["posts", userId],
    queryFn: async () => {
      const res = await makeRequest.get(userId ? `/posts?userId=${userId}` : "/posts");
      return res.data;
    }
  });

  // console.log(data);


  return (
    <div className="posts">
      {error ? (
        "Something went wrong!"
      ) : isLoading ? (
        "Loading..."
      ) : (
        data.map((post) => <Post post={post} key={post.id} />)
      )}
    </div>
  );
};

export default Posts;
