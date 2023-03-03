import { USERNAME_KEY } from "../../../constants/messaging";


export const persistUsername = (username) => {
  if (typeof localStorage !== "undefined"){
    localStorage.setItem(USERNAME_KEY, username);
  }
};

export const getPersistedUsername = () => {
  if (typeof localStorage !== "undefined"){
    return localStorage.getItem(USERNAME_KEY) || '';
  }
  return '';
};

export const getIsParanoidMode = () => {
  if (typeof document !== "undefined"){
    return document.location.hash.endsWith('----') || false;
  }
  return false;
};

export const getIsPincodeRequired = () => {
  if (typeof document !== "undefined") {
    return document.location.hash.endsWith('--') || false;
  }
  return false;
};
