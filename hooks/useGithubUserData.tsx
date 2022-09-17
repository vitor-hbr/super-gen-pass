import { useEffect, useState } from "react";

export const useGithubUserData = () => {
  const [userData, setUserData] = useState({
    avatar_url: "",
    name: "",
    bio: "",
    html_url: "",
    followers: 0,
    following: 0,
    public_repos: 0,
    public_gists: 0,
  });

  useEffect(() => {
    fetch("https://api.github.com/users/vitor-hbr")
      .then((response) => response.json())
      .then((data) => setUserData(data));
  }, []);

  return userData;
};
