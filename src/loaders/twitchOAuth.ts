import { PassportStatic } from "passport";
import { Strategy } from "passport-twitch-new";
import authRoutes from "../api/routes/auth";
import config from "../config";
import express from "express";
import { findOrCreateUser } from "../services/user";

export default async ({
  app,
  passport,
}: {
  app: express.Application;
  passport: PassportStatic;
}) => {
  passport.use(
    new Strategy(
      {
        callbackURL: config.twitch.callbackURL,
        clientID: config.twitch.clientId,
        clientSecret: config.twitch.clientSecret,
        scope: "",
        customHeaders: {
          "client-id": config.twitch.clientId,
        },
      },
      async (accessToken, refreshToken, profile, done) => {
        let error = null;
        let user = null;
        try {
          user = await findOrCreateUser(
            +profile.id,
            profile.display_name,
            profile.profile_image_url
          );
        } catch (err) {
          error = err;
        }
        done(error, user);
      }
    )
  );

  passport.serializeUser(function (user, done) {
    done(null, user);
  });

  passport.deserializeUser(function (user, done) {
    //@ts-ignore
    done(null, user);
  });

  authRoutes(app, passport);
};
