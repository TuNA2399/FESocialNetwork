import { useState, useContext, useEffect } from "react";
import "./update.scss";
import { makeRequest } from "../../axios";
import { AuthContext } from "../../context/authContext";
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from "axios";

const Update = ({ setOpenUpdate, user }) => {
    const { currentUser, setCurrentUser } = useContext(AuthContext);
    const [cover, setCover] = useState(null);
    const [profile, setProfile] = useState(null);

    const getSignature = async () => {
        const res = await makeRequest.get("/signature");
        return res.data;
    };

    const [text, setText] = useState({
        name: "",
        city: "",
        website: "",
    });

    const fetchCurrentUser = async () => {
        const res = await makeRequest.get(`/users/find/${currentUser.id}`);
        return res.data;
    };

    useEffect(() => {
        setText({
            name: currentUser.name || "",
            city: currentUser.city || "",
            website: currentUser.website || "",
        });
    }, [currentUser]);

    const upload = async (file) => {
        try {
            const signatureData = await getSignature();

            const formData = new FormData();
            formData.append("file", file);
            formData.append("api_key", signatureData.apiKey);
            formData.append("timestamp", signatureData.timestamp);
            formData.append("signature", signatureData.signature);
            formData.append("folder", signatureData.folder);
            formData.append("upload_preset", signatureData.uploadPreset);

            const cloudinaryRes = await axios.post(
                `https://api.cloudinary.com/v1_1/${signatureData.cloudName}/auto/upload`,
                formData
            );

            return cloudinaryRes.data.secure_url;
        } catch (err) {
            console.error("Cloudinary upload error:", err);
        }
    };

    const handleChange = (e) => {
        setText((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: async (updatedUser) => {
            const res = await makeRequest.put("/users", updatedUser);
            return res.data;
        },
        onSuccess: async () => {
            queryClient.invalidateQueries(["user"]);

            const updatedUser = await makeRequest.get(`/users/find/${currentUser.id}`);
            setCurrentUser(updatedUser.data);
        },
    });


    const handleSubmit = async (e) => {
        e.preventDefault();

        const coverUrl = cover ? await upload(cover) : user.coverPic;
        const profileUrl = profile ? await upload(profile) : user.profilePic;

        const updatedUser = {
            ...text,
            coverPic: coverUrl,
            profilePic: profileUrl,
            email: currentUser.email,
        };

        mutation.mutate(updatedUser);
        setOpenUpdate(false);
    };

    return (
        <div className="update-form">
            <h2>Update Profile</h2>
            <form onSubmit={handleSubmit}>
                <label>Cover Photo</label>
                <input type="file" onChange={(e) => setCover(e.target.files[0])} />

                <label>Profile Picture</label>
                <input type="file" onChange={(e) => setProfile(e.target.files[0])} />

                <input
                    type="text"
                    name="name"
                    onChange={handleChange}
                    placeholder="Name"
                    value={text.name}
                />
                <input
                    type="text"
                    name="city"
                    onChange={handleChange}
                    placeholder="City"
                    value={text.city}
                />
                <input
                    type="text"
                    name="website"
                    onChange={handleChange}
                    placeholder="Website"
                    value={text.website}
                />

                <button type="submit" className="update-button">Update</button>
            </form>
            <button className="close-button" onClick={() => setOpenUpdate(false)}>Cancel</button>
        </div>
    );
};

export default Update;
