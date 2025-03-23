
'use client'
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { SignUpSchema } from "@repo/common/type"
import { useState } from "react"
import axios from "axios"
import { HTTP_URL } from "be-common/config"
import { toast } from "sonner"
import { Form, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"



const SignUp = () => {
    const router = useRouter()
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false)


    const form = useForm<z.infer<typeof SignUpSchema>>({
        resolver: zodResolver(SignUpSchema)
    })
    const onSubmit = async (data: z.infer<typeof SignUpSchema>) => {

        setIsSubmitting(true);
        console.log(data);

        try {
            const response = await axios.post(`${HTTP_URL}/signup`, data);
            console.log(response);
            toast.success(response.data.message);
            router.replace("/rooms")

        } catch (error) {
            if (axios.isAxiosError(error)) {
                toast.error(error.response?.data.message ?? "An error occurred. User signup failed");
            } else {

                toast.error("An unexpected error occurred. User signup failed");
            }
            setIsSubmitting(false)
        } finally {
            setIsSubmitting(false);
        }


    }
    return (
        <div>
            <div className="flex justify-center items-center min-h-screen bg-matisse-950 px-6">
                <div className="w-full max-w-md p-8 space-y-8 bg-matisse-50 rounded-lg  ">
                    <div className="text-center">
                        <h1 className="text-4xl font-bold tracking-tight lg:text-5xl mb-6">
                            Join Draw-board
                        </h1>
                        <p className="mb-4 text-matisse-800 text-[16px]">Sign up and explore your creativity🤗</p>
                    </div>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <FormField
                                name="username"
                                control={form.control}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Username</FormLabel>
                                        <Input
                                            {...field}
                                            className="mt-3"
                                        />
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                name="email"
                                control={form.control}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email</FormLabel>
                                        <Input {...field} name="email" className="mt-3" />
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                name="password"
                                control={form.control}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Password</FormLabel>
                                        <Input type="password" {...field} name="password" className="mt-3" />
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button type="submit" className='w-full bg-matisse-200 text-matisse-700 hover:bg-matisse-700 hover:text-matisse-50
                            shadow-matisse-600/50 drop-shadow-xl shadow-md ' disabled={isSubmitting}>
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Please wait
                                    </>
                                ) : (
                                    'Sign Up'
                                )}
                            </Button>
                        </form>
                    </Form>
                    <div className="text-center mt-4 text-sm tracking-wide">
                        <p >
                            Already a member?
                            <Link href="/signin" className="text-blue-600 hover:text-blue-800 pl-2">
                                Sign in
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )

}

export default SignUp