import { z } from "zod";

export const SignInSchema = z.object({
    email: z.string().min(1, { message: "Please enter your email" }),
    password: z
        .string()
        .min(1, {
            message: "Please enter your password",
        })
        .min(6, {
            message: "Password must be at least 6 characters long",
        }),
});

export const SignUpSchema = z
    .object({
        email: z.string().min(1, { message: "Please enter your email" }),
        password: z
            .string()
            .min(1, {
                message: "Please enter your password",
            })
            .min(6, {
                message: "Password must be at least 6 characters long",
            }),
        confirm_password: z.string(),
    })
    .refine((data) => data.password === data.confirm_password, {
        message: "Passwords don't match.",
        path: ["confirm_password"],
    });


export type SignInFormValues = z.infer<typeof SignInSchema>;
export type SignUpFormValues = z.infer<typeof SignUpSchema>;
