const usernameInput = document.querySelector("#username");
const containerRightli = document.querySelectorAll(".container-right ul li");
const resultDivH1 = document.querySelector("#result h1");
const resultDiv = document.querySelector("#result");
const finderDiv = document.querySelector("#finderdiv");
const projects = document.querySelector(".projects");
const profilimg = document.querySelector("#profilimg");
const githubName = document.querySelector("#githubName");
const userlink = document.querySelector("#userlink");
const biospan = document.querySelector("#biospan");
const locationP = document.querySelector("#location");
const reposnumber = document.querySelectorAll("#reposnumber");
const starsnumber = document.querySelectorAll("#starsnumber");
const followersNumber = document.querySelectorAll("#followersNumber");
const followsNumber = document.querySelectorAll("#followsNumber");
const name = document.querySelector("#name");
const starsrepo = document.querySelector(".starsrepo");
const reposlist = document.querySelector("#reposlist");
const followersLink = document.querySelector("#followersLink");
const followsLink = document.querySelector("#followsLink");

containerRightli.forEach(item => {
  item.addEventListener("click", function () {
    containerRightli.forEach(li => li.classList.remove("active"));
    this.classList.add("active");
  });
});

function finder() {
  const username = usernameInput.value.trim();
  finderDiv.style.display = "flex";
  resultDiv.style.display = "none";

  if (!username) {
    resultDivH1.innerHTML = "Please enter your username.";
    return;
  }

  resultDivH1.innerHTML = "Loading...";
  projects.innerHTML = "";

  fetch(`https://api.github.com/users/${username}`)
    .then(res => {
      if (!res.ok) throw new Error("User not found!");
      return res.json();
    })
    .then(user => {
      Promise.all([
        fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=100`).then(res => res.json()),
        fetch(`https://api.github.com/users/${username}/starred?per_page=100`).then(res => res.json())
      ]).then(([repos, starredRepos]) => {
        const starredCount = Array.isArray(starredRepos) ? starredRepos.length : 0;
        rightfunc(repos);
        leftfunc(user, starredCount);

        starsrepo.addEventListener("click", (e) => {
          e.preventDefault();
          leftfunc(user, starredCount);
          starsfunc(username);
        });

        reposlist.addEventListener("click", (e) => {
          e.preventDefault()
          leftfunc(user, starredCount);
          rightfunc(repos);
        });

        followersLink.addEventListener("click", (e) => {
          e.preventDefault()
          followersfunc(username, 'followers');
        })

        followsLink.addEventListener("click", (e) => {
          e.preventDefault()
          followersfunc(username, 'following');
        })

      });
    })
    .catch(err => {
      resultDivH1.innerHTML = err.message;
      finderDiv.style.display = "none";
      resultDiv.style.display = "flex";
    });

  usernameInput.value = "";
}

function createRepoDiv(repo) {
  const reposDiv = document.createElement("div");
  reposDiv.classList.add("repos");

  const bottom = document.createElement("div");
  bottom.classList.add("bottom");

  const bottomLeft = document.createElement("div");
  bottomLeft.classList.add("bottom-left");

  const bottomLeftA = document.createElement("a");
  bottomLeftA.target = "_blank";
  bottomLeftA.href = repo.html_url;
  bottomLeftA.innerHTML = repo.name || repo.full_name;

  const updatedAt = new Date(repo.updated_at);
  const daysAgo = Math.floor((new Date() - updatedAt) / (1000 * 60 * 60 * 24));
  const updateText = daysAgo === 0 ? "Updated today" : `Updated ${daysAgo} days ago`;

  const bottomLeftP = document.createElement("p");
  bottomLeftP.innerHTML = updateText;

  const bottomRight = document.createElement("div");
  bottomRight.classList.add("bottom-right");
  const bottomRightP = document.createElement("p");
  bottomRightP.innerHTML = repo.private ? "Private" : "Public";

  const top = document.createElement("div");
  top.classList.add("top");

  const i1 = document.createElement("i");
  i1.classList.add("ri-file-code-fill");
  const span1 = document.createElement("span");
  span1.innerHTML = repo.language || "Unknown";

  const i2 = document.createElement("i");
  i2.classList.add("ri-eye-fill");
  const span2 = document.createElement("span");
  span2.innerHTML = repo.watchers_count;

  const i3 = document.createElement("i");
  i3.classList.add("ri-star-fill");
  const span3 = document.createElement("span");
  span3.innerHTML = repo.stargazers_count;

  top.append(i1, span1, i2, span2, i3, span3);
  bottomLeft.append(bottomLeftA, bottomLeftP);
  bottomRight.append(bottomRightP);
  bottom.append(bottomLeft, bottomRight);
  reposDiv.append(bottom, top);

  return reposDiv;
}

function rightfunc(repos) {
  projects.innerHTML = "";
  if (repos.length === 0) {
    projects.innerHTML = "<p style='color: white; font-weight: 900;'>This user does not have any repositories.</p>";
    return;
  }
  repos.forEach(repo => {
    projects.append(createRepoDiv(repo));
  });
}

function leftfunc(user, stars) {
  profilimg.src = user.avatar_url;
  githubName.innerHTML = user.name || user.login;
  name.innerHTML = user.login;
  userlink.href = user.html_url;
  biospan.innerHTML = user.bio || "There is no bio";
  locationP.innerHTML = user.location || "No location";

  reposnumber.forEach(item => item.innerHTML = user.public_repos);
  starsnumber.forEach(item => item.innerHTML = stars);
  followersNumber.forEach(item => item.innerHTML = user.followers);
  followsNumber.forEach(item => item.innerHTML = user.following);
}

function starsfunc(username) {
  projects.innerHTML = "<p style='color: white; font-weight: 900;'>Loading...</p>";

  fetch(`https://api.github.com/users/${username}/starred?per_page=100`)
    .then(res => res.json())
    .then(repos => {
      if (!Array.isArray(repos) || repos.length === 0) {
        projects.innerHTML = `<p>No repos have been given stars.</p>`;
        return;
      }

      projects.innerHTML = "";
      repos.forEach(repo => {
        projects.append(createRepoDiv(repo));
      });
    })
    .catch(() => {
      projects.innerHTML = "<p style='color:red;'>No information received.</p>";
    });
}

function followersfunc(username, type) {
  projects.innerHTML = "<p style='color: white; font-weight: 900;'>Loading...</p>";
  fetch(`https://api.github.com/users/${username}/${type}?per_page=100`)
    .then(res => res.json())
    .then(users => {
      if (!Array.isArray(users) || users.length === 0) {
        userListDiv.innerHTML = `<p>Heç kim ${type === "followers" ? "is not following you" : "not tracked"}.</p>`;
        return;
      }
      projects.innerHTML = ""

      users.forEach(item => {
        const followcontainer = document.createElement("div");
        followcontainer.classList.add("followcontainer");
        const followleft = document.createElement("div");
        followleft.classList.add("followleft");
        const followleftImg = document.createElement("img");
        followleftImg.src = item.avatar_url;
        const followleftH3 = document.createElement("h3");
        followleftH3.innerHTML = item.login;
        const linkfollow = document.createElement("div");
        linkfollow.classList.add("linkfollow");
        const linkfollowA = document.createElement("a");
        linkfollowA.href = item.html_url;
        linkfollowA.target = "_blank";
        linkfollowA.classList.add("ri-links-line");

        linkfollow.append(linkfollowA)
        followleft.append(followleftImg, followleftH3)
        followcontainer.append(followleft, linkfollow)
        projects.append(followcontainer);
      })
    })
    .catch(() => {
      projects.innerHTML = "<p style='color:red;'>No information received.</p>";
    });
}