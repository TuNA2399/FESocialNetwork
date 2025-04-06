import "./rightBar.scss";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useContext } from "react";
import { AuthContext } from "../../context/authContext";
import { makeRequest } from "../../axios";
import { Link } from "react-router-dom";

const RightBar = () => {
  const { currentUser } = useContext(AuthContext);
  const queryClient = useQueryClient();

  const { isLoading, error, data } = useQuery({
    queryKey: ["friends", currentUser?.id],
    queryFn: async () => {
      const res = await makeRequest.get("/relationships/friends");
      return res.data;
    },
    enabled: !!currentUser?.id,
  });


  const {
    isLoading: unfollowedLoading,
    error: unfollowedErr,
    data: unfollowedData,
  } = useQuery({
    queryKey: ["unfollowedUsers", currentUser?.id],
    queryFn: async () => {
      const res = await makeRequest.get("/relationships/unfollowed");
      return res.data;
    },
    enabled: !!currentUser?.id,
  });


  const mutationFollow = useMutation({
    mutationFn: async (followedUserId) => {
      const res = await makeRequest.post("/relationships", { followedUserId });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["friends", currentUser?.id]);
      queryClient.invalidateQueries(["unfollowedUsers", currentUser?.id]);
    },
  });

  const handleFollow = (userId) => {
    mutationFollow.mutate(userId);
  };


  return (
    <div className="rightBar">
      <div className="container">
        {!currentUser?.id ? (
          <div>Loading user data...</div>
        ) : (
          <>
            <div className="item">
              <span>Suggestions For You</span>
              {unfollowedLoading ? (
                "Loading..."
              ) : unfollowedErr ? (
                "Error loading suggestions"
              ) : (
                [...unfollowedData]
                  .sort(() => Math.random() - 0.5) // Shuffle the array randomly
                  .slice(0, 3) // Take only the first 4 users
                  .map((user) => (
                    <div className="user" key={user.id}>
                      <div className="userInfo">
                        <img
                          src={
                            user.profilePic
                              ? "/upload/" + user.profilePic
                              : "https://images.pexels.com/photos/13916254/pexels-photo-13916254.jpeg?auto=compress&cs=tinysrgb&w=1600&lazy=load"
                          }
                          alt={user.name}
                        />
                        <span>{user.name}</span>
                      </div>
                      <div className="buttons">
                        <button onClick={() => handleFollow(user.id)}>Follow</button>
                      </div>
                    </div>
                  ))
              )}
            </div>

            <div className="item">
              <span>Latest Activities</span>
              {[...Array(4)].map((_, index) => (
                <div className="user" key={index}>
                  <div className="userInfo">
                    <img
                      src="https://images.pexels.com/photos/4881619/pexels-photo-4881619.jpeg?auto=compress&cs=tinysrgb&w=1600"
                      alt=""
                    />
                    <p>
                      <span>Jane Doe</span> changed their cover picture
                    </p>
                  </div>
                  <span>1 min ago</span>
                </div>
              ))}
            </div>

            <div className="item">
              <span>Online Friends</span>
              {isLoading ? (
                "Loading..."
              ) : error ? (
                "Error loading friends"
              ) : (
                data.map((user) => (
                  <div className="user" key={user.id}>
                    <div className="userInfo">
                      <img
                        src={`/upload/${user.profilePic}` || "https://images.pexels.com/photos/13916254/pexels-photo-13916254.jpeg?auto=compress&cs=tinysrgb&w=1600&lazy=load"}
                        alt={user.name}
                      />
                      <div className="online" />
                      <Link
                        to={`/profile/${user.id}`}
                        style={{ textDecoration: "none", color: "inherit" }}
                        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
                        <span>{user.name}</span>
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default RightBar;
