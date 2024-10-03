import {createRoute, OpenAPIHono, z} from "@hono/zod-openapi";
import {swaggerUI} from "@hono/swagger-ui";
import {jwt, JwtVariables, sign} from 'hono/jwt'
import {HTTPException} from "hono/http-exception";
import {logger} from "hono/logger";
import {basicAuth} from "hono/basic-auth";
import {prettyJSON} from "hono/pretty-json";
import {addUser, getUserByUsername, getUsers, NewUser} from "../db/schema/users";
import {every, except} from "hono/combine";
import {csrf} from "hono/csrf";
import {Result} from "./result";
import moment from "moment";
import {NotFoundEntityException} from "../db";

type Variables = JwtVariables;

const app = new OpenAPIHono<{ Variables: Variables }>();
const jwtSecret = 'it-is-very-secret'

app.use(logger());
app.use(prettyJSON());
app.use(csrf({origin: ["www.3x5c2.cn", "3x5c2.cn"]}));
app.use(
    "/api/swagger/*",
    basicAuth({
        username: 'hono',
        password: 'hono',
    }),
);
app.use(
    "/api/*",
    except(
        ["/api/login", "/api/swagger/*"],
        every(
            jwt({secret: jwtSecret}),
            async (c, next) => {
                const {username, gt} = c.get('jwtPayload')
                const user = await getUserByUsername(username);
                if (moment(gt).isBefore(moment().subtract(30, 'day')) || moment(gt).isAfter(moment(user.passwordChangeTime))) {
                    throw new HTTPException(401, {message: "Token expired"})
                }
                await next()
            }
        ),
    ),
);

app.notFound((c) => {
    return c.json({error: "No Found This API"}, 404);
});
app.onError((err, c) => {
    if (err instanceof HTTPException) {
        return c.json(Result.error(err.status, err.message), err.status);
    }
    if (err instanceof NotFoundEntityException) {
        return c.json(Result.error(404, err.message), 404);
    }
    return c.json(Result.error(500, err.message), 500);
});

app.get("/users", async (c) => {
    return c.json(await getUsers());
});

app.post("/users", async (c) => {
    const params = await c.req.json<NewUser>();
    return c.json(
        await addUser(params),
    );
});

app.openapi(
    createRoute({
        method: "post",
        path: "/api/login",
        summary: "Login",
        request: {
            body: {
                content: {
                    "application/json": {
                        schema: z.object({
                            username: z.string().openapi({example: "admin"}),
                            password: z.string().openapi({example: "admin"}),
                        }),
                    },
                },
            },
        },
        responses: {
            200: {
                description: "Respond a token",
                content: {
                    "application/json": {
                        schema: z.object({
                            token: z.string(),
                        }),
                    },
                },
            },
            401: {
                description: "Unauthorized",
            },
        },
    }),
    async (c) => {
        const {username, password} = await c.req.json();
        try {
            const user = await getUserByUsername(username);
            if (user.password === password) {
                const token = await sign({username, "gt": moment().valueOf()}, jwtSecret);
                return c.json(Result.success({token}));
            }
        } catch (e) {
            if (e instanceof NotFoundEntityException) {
                throw new HTTPException(401, {message: e.message});
            }
        }
        throw new HTTPException(401, {message: "账号或密码错误"});
    },
);
app.openapi(
    createRoute({
        method: "get",
        path: "/api/hello",
        summary: "Say hello with auth",
        responses: {
            200: {
                description: "Respond a message",
                content: {
                    "application/json": {
                        schema: z.object({
                            message: z.string(),
                        }),
                    },
                },
            },
        },
    }),
    (c) => {
        return c.json({
            message: "hello",
        });
    },
);

app.get(
    '/api/swagger/ui',
    swaggerUI({
        url: '/api/swagger/doc',
    })
)

app.doc('/api/swagger/doc', {
    info: {
        title: '3x5c2 API',
        version: '241003',
    },
    openapi: '3.1.0'
})

export default app
