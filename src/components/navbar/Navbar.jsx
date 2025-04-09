import "./navbar.scss";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import WbSunnyOutlinedIcon from "@mui/icons-material/WbSunnyOutlined";
import GridViewOutlinedIcon from "@mui/icons-material/GridViewOutlined";
import NotificationsOutlinedIcon from "@mui/icons-material/NotificationsOutlined";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import { Link } from "react-router-dom";
import { DarkModeContext } from "../../context/darkModeContext";
import { AuthContext } from "../../context/authContext";
import { useState, useContext, useRef, useEffect } from "react";
import { makeRequest } from "../../axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const Navbar = () => {
  const { toggle, darkMode } = useContext(DarkModeContext);
  const { currentUser } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const queryClient = useQueryClient();

  const searchRef = useRef();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setUsers([]);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const mutation = useMutation({
    mutationFn: async (input) => {
      const res = await makeRequest.get(`/users/search?name=${input}`);
      return res.data;
    },
    onSuccess: (data) => {
      setUsers(data);
      queryClient.invalidateQueries(["userSearched"]);
    },
  });

  const handleChange = (e) => {
    const inputValue = e.target.value;
    setSearchTerm(inputValue);
    if (inputValue.trim() !== "") {
      mutation.mutate(inputValue);
    } else {
      setUsers([]);
    }
  };

  return (
    <div className="navbar">
      <div className="left">
        <Link to="/" style={{ textDecoration: "none" }}>
          <span>TunaOcean</span>
        </Link>
        <HomeOutlinedIcon />
        {darkMode ? (
          <WbSunnyOutlinedIcon onClick={toggle} />
        ) : (
          <DarkModeOutlinedIcon onClick={toggle} />
        )}
        <GridViewOutlinedIcon />

        <div className="search" ref={searchRef}>
          <SearchOutlinedIcon />
          <input
            type="text"
            placeholder="Search..."
            onChange={handleChange}
            value={searchTerm}
          />
          {users.length > 0 && (
            <div className="search-results">
              {users.map((user) => (
                <Link
                  key={user.id}
                  to={`/profile/${user.id}`}
                  className="search-result-item"
                  onClick={() => {
                    setUsers([]);
                    setSearchTerm("");
                  }}
                >
                  <img src={user.profilePic} alt="" />
                  <span>{user.name}</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="right">
        <PersonOutlinedIcon />
        <EmailOutlinedIcon />
        <NotificationsOutlinedIcon />
        <Link style={{ textDecoration: "none" }} to={`/profile/${currentUser.id}`}>
          <div className="user">
            <img src={currentUser.profilePic} alt="" />
            <span>{currentUser.name}</span>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default Navbar;
