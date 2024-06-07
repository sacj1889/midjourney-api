import { imagineHandler } from "../controller/imagine";
import type { Router } from "express";

export default (router: Router) => {
  const getRoute = (route = "") => {
    return `/imagine${route}`;
  };

  router.post(getRoute(""), imagineHandler);

};
