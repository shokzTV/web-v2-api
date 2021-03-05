import { Request, Response, Router } from "express";
import { checkAPIKey, checkUserRole } from "../../middlewares/access";
import {
  createVideo,
  deleteVideo,
  getLatestVideos,
  getVideoIds,
  listVideos,
  loadVideosById,
  patchVideo,
  patchVideoFromFetcher,
} from "../../services/video";
import { getArrayFromBody, getIdsFromRequest } from "./helper";

const route = Router();

export default (app: Router) => {
  app.use("/video", route);

  route.get("/latest", async (req: Request, res: Response) => {
    const videos = await getLatestVideos();
    return res.json(videos).status(200);
  });

  route.get("/ids", async (req: Request, res: Response) => {
    const videos = await getVideoIds();
    return res.json(videos).status(200);
  });

  route.get("/list", async (req: Request, res: Response) => {
    const ids = getIdsFromRequest(req);
    let videos = [];
    if (ids.length) {
      videos = await loadVideosById(ids);
    } else {
      videos = await listVideos();
    }
    return res.json(videos).status(200);
  });

  route.post(
    "/create",
    checkUserRole("VIDEO_CREATE"),
    async (req: Request, res: Response) => {
      const { title, source } = req.body;
      const videoId = await createVideo(
        title,
        source,
        getArrayFromBody(req.body.tags)
      );
      return res.json(videoId).status(201);
    }
  );

  route.patch(
    "/:videoId",
    checkUserRole("VIDEO_EDIT"),
    async (req: Request, res: Response) => {
      await patchVideo(
        +req.params.videoId,
        req.body.title,
        getArrayFromBody(req.body.tags)
      );
      return res.send().status(204);
    }
  );

  route.delete(
    "/:videoId",
    checkUserRole("VIDEO_DELETE"),
    async (req: Request, res: Response) => {
      await deleteVideo(+req.params.videoId);
      return res.send().status(204);
    }
  );

  route.post(
    "/createFromFetcher",
    checkAPIKey,
    async (req: Request, res: Response) => {
      const { title, source } = req.body;
      const videoId = await createVideo(title, source, []);
      return res.json(videoId).status(201);
    }
  );

  route.patch(
    "/patchFromFetcher",
    checkAPIKey,
    async (req: Request, res: Response) => {
      const { title, source } = req.body;
      await patchVideoFromFetcher(title, source);
      return res.sendStatus(204);
    }
  );
};
