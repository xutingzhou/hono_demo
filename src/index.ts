import {createRoute, OpenAPIHono, z} from "@hono/zod-openapi";
import {swaggerUI} from "@hono/swagger-ui";
import {jwt, JwtVariables, sign} from 'hono/jwt'
import {HTTPException} from "hono/http-exception";
import {logger} from "hono/logger";
import {basicAuth} from "hono/basic-auth";
import {prettyJSON} from "hono/pretty-json";
import {users} from "../db/schema/users";
import {db} from "../db";

type Variables = JwtVariables;

const app = new OpenAPIHono<{ Variables: Variables }>();
const jwtSecret = 'it-is-very-secret'

app.use(logger())
app.use(prettyJSON())
app.use(
    '/auth/*',
    jwt({
        secret: jwtSecret,
    })
)
app.use(
    '/ui',
    basicAuth({
        username: 'hono',
        password: 'hono',
    })
)

app.get("/users", async (c) => {
    return c.json(await db.select().from(users));
});

app.post("/users", async (c) => {
    const params = await c.req.json<typeof users.$inferSelect>();
    return c.json(
        await db.insert(users).values({
            fullName: params.fullName,
            phone: params.phone,
            password: params.password,
        }),
    );
});

app.openapi(
    createRoute({
        method: "get",
        path: "/hello",
        summary: "Say hello",
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
app.openapi(
    createRoute({
        method: "post",
        path: "/login",
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
        if (username === "admin" && password === "admin") {
            const token = await sign({username}, jwtSecret);
            return c.json({token});
        }
        throw new HTTPException(401, {message: "Unauthorized"});
    },
);
app.openapi(
    createRoute({
        method: "get",
        path: "/auth/hello",
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
    '/ui',
    swaggerUI({
        url: '/doc',
    })
)

app.doc('/doc', {
    info: {
        title: 'An API',
        version: 'v1'
    },
    openapi: '3.1.0'
})

export default app
