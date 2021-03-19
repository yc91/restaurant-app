import axios from "axios";

const getUser = () => {
  return new Promise((resolve, reject) => {
    axios
      .get("/api/verify")
      .then(function (response) {
        resolve(response.data);
      })
      .catch(function (error) {
        reject(error);
      });
  });
};

const getCollections = (userId) => {
  return new Promise((resolve, reject) => {
    axios
      .post("/api/get-collection", {
        user: userId,
      })
      .then(function (response) {
        resolve(response.data.data);
      })
      .catch(function (error) {
        reject(error);
      });
  });
};

const createCollection = (values, userId) => {
  return new Promise((resolve, reject) => {
    axios
      .post("/api/create-collection", {
        name: values.name,
        user: userId,
      })
      .then(function (response) {
        resolve(response.data.status);
      })
      .catch(function (error) {
        reject(error);
      });
  });
};

const removeCollection = (collectionId, userId) => {
  return new Promise((resolve, reject) => {
    axios
      .post("/api/remove-collection", {
        collection: collectionId,
        user: userId,
      })
      .then(function (response) {
        resolve(response.data.status);
      })
      .catch(function (error) {
        reject(error);
      });
  });
};

const updateCollectionName = (collectionId, userId, name) => {
  return new Promise((resolve, reject) => {
    axios
      .post("/api/update-collection-name", {
        collection: collectionId,
        user: userId,
        name: name,
      })
      .then(function (response) {
        resolve(response.data.status);
      })
      .catch(function (error) {
        reject(error);
      });
  });
};

const getRestaurantFromCollection = (userId) => {
  return new Promise((resolve, reject) => {
    axios
      .post("/api/get-restaurant-collection", {
        user: userId,
      })
      .then(function (response) {
        resolve(response.data.data);
      })
      .catch(function (error) {
        reject(error);
      });
  });
};

const getAllRestaurants = (query = null) => {
  return new Promise((resolve, reject) => {
    let apiUrl = "/api/get-restaurant";
    if (query) {
      let params = Object.keys(query)
        .map(
          (element) =>
            encodeURIComponent(element) +
            "=" +
            encodeURIComponent(query[element])
        )
        .join("&");

      if (params) {
        apiUrl += "?" + params;
      }
    }
    resolve(axios.get(apiUrl));
  });
};

const getRestaurantFromOneCollection = (userId, collectionId) => {
  return new Promise((resolve, reject) => {
    axios
      .post("/api/get-restaurant-one-collection", {
        user: userId,
        collection: collectionId,
      })
      .then(function (response) {
        resolve(response.data.data);
      })
      .catch(function (error) {
        reject(error);
      });
  });
};

const addRestaurantToCollection = (collectionId, restaurantId) => {
  return new Promise((resolve, reject) => {
    axios
      .post("/api/add-restaurant-collection", {
        restaurant: restaurantId,
        collection: collectionId,
      })
      .then((response) => {
        resolve(response.data.status);
      })
      .catch(function (error) {
        reject(error);
      });
  });
};

const removeRestaurantFromCollection = (collectionId, restaurantId) => {
  return new Promise((resolve, reject) => {
    axios
      .post("/api/remove-restaurant-collection", {
        restaurant: restaurantId,
        collection: collectionId,
      })
      .then(function (response) {
        resolve(response.data.status);
      })
      .catch(function (error) {
        reject(error);
      });
  });
};

const login = (values) => {
  return new Promise((resolve, reject) => {
    axios
      .post("/api/login", {
        email: values.email,
        password: values.password,
      })
      .then(function (response) {
        resolve(response.data.token);
      })
      .catch(function (error) {
        reject(error);
      });
  });
};

const register = (values) => {
  return new Promise((resolve, reject) => {
    axios
      .post("/api/create-user", {
        email: values.email,
        password: values.password,
        confirmPassword: values.confirmPassword,
      })
      .then(function (response) {
        resolve(response.data.token);
      })
      .catch(function (error) {
        reject(error);
      });
  });
};

export {
  getUser,
  getCollections,
  createCollection,
  getRestaurantFromCollection,
  removeCollection,
  updateCollectionName,
  getAllRestaurants,
  getRestaurantFromOneCollection,
  addRestaurantToCollection,
  removeRestaurantFromCollection,
  login,
  register
};
