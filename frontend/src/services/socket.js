import { io } from "socket.io-client";
import API_URL from "./api";

const socket = io(API_URL, {
  withCredentials: true,
});

export default socket;