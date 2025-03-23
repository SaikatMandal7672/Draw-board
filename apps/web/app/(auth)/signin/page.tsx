
'use client'
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { SignInSchema } from "@repo/common/type"
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



const SignIn = () => {
    const router = useRouter()
    console.log(HTTP_URL)
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false)


    const form = useForm<z.infer<typeof SignInSchema>>({
        resolver: zodResolver(SignInSchema)
    })
    const onSubmit = async (data: z.infer<typeof SignInSchema>) => {

        setIsSubmitting(true);
        console.log(data);
        
        try {
            const response = await axios.post(`${HTTP_URL}/signin`, data);
            localStorage.setItem("token",response.data.token)
            toast.success(response.data.message);

            router.replace("/rooms")

        } catch (error) {
            if (axios.isAxiosError(error)) {
                toast.error(error.response?.data.message ?? "An error occurred. User signin failed");
            } else {

                toast.error("An unexpected error occurred. User signin failed");
            }
            setIsSubmitting(false)
        } finally {
            setIsSubmitting(false);
        }


    }
    return (
        <div> <div className="flex justify-center items-center min-h-screen bg-matisse-950">
            <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
                <div className="text-center">
                    <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-6 text-neutral-950">
                        Draw-board
                    </h1>
                    <p className="mb-4 text-xl text-matisse-700">SignIn to your Account</p>
                </div>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

                        <FormField
                            name="identifier"
                            control={form.control}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email/Username</FormLabel>
                                    <Input {...field} name="email/username" className="rounded-lg" />

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
                                    <Input type="password" {...field} name="password" />
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="submit" className='w-full bg-matisse-200 text-matisse-700 hover:bg-matisse-700 hover:text-matisse-50 ' disabled={isSubmitting}>
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Please wait
                                </>
                            ) : (
                                'Sign In'
                            )}
                        </Button>
                    </form>
                </Form>
                <div className="text-center mt-4">
                    <p>
                        Don&apos;t have an account?{' '}
                        <Link href="/signup" className="text-blue-600 hover:text-blue-800">
                            Sign up
                        </Link>
                    </p>
                </div>
            </div>
        </div></div>
    )

}

export default SignIn