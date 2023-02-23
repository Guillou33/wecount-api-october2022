import { Response, NextFunction } from "express";
import CustomRequest from "@service/core/express/CustomRequest";
import fs from "fs";
import jwt from "jsonwebtoken";
import config from "config";

const jwtConfig: any = config.get('jwt');

const PUBLIC_KEY_PATH = jwtConfig.publicKeyPath;

export default (
  req: CustomRequest,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || authHeader.indexOf("Bearer ") === -1) {
    next();
    return;
  }

  const jwtToken = authHeader.substr(authHeader.indexOf("Bearer ") + 7);

  try {
    const cert = fs.readFileSync(PUBLIC_KEY_PATH);
    let userAuthInfo = jwt.verify(jwtToken, cert) as
      | { [key: string]: any }
      | string;

    if (typeof userAuthInfo !== "string") {
      if (
        userAuthInfo.email &&
        userAuthInfo.id &&
        typeof userAuthInfo.email === "string" &&
        typeof userAuthInfo.id === "number"
      ) {
        req.userAuthInfo = {
          email: userAuthInfo.email,
          id: userAuthInfo.id,
          roles: userAuthInfo.roles,
          locale: userAuthInfo.locale,
          isImpersonation: userAuthInfo.isImpersonation ?? false,
        };
      }
    }
    next();
  } catch (error: any) {
    console.log("error", error.name);
    if (error.name && error.name === "TokenExpiredError") {
      res.status(401).send({
        reject_reason: "expired_token",
      });
    } else {
      res.status(400).send({
        reject_reason: "invalid_token",
      });
    }
  }
};
