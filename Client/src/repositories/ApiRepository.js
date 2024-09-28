import Repository from "./Repository";

export default {
  // Example GET
  getLandmarks ( ) {
    return Repository.new().get("/");
  },
  // Example POST
  createLandmark ( data) {
    return Repository.new().post("/", data);
  },
  updateLandmark (id, data) {
    return Repository.new().post("/update/" + id, data);
  },
  deleteLandmark (id) {
    return Repository.new().post("/delete/" + id);
  },
  importLandmarks (data) {
    return Repository.new().post("/import", data);
  },

  //AUTH
  login (email, password) {
    return Repository.new().post("/login", {email: email, password: password});
  },
  register (email, password,verifypassword) {
    return Repository.new().post("/register", {email: email, password: password , verifypassword:verifypassword});
  },
  //POST


  //GET
};
