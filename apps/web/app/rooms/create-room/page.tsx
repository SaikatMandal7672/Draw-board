
'use client'

import { useForm } from "react-hook-form"

import { useState } from "react"
import axios from "axios"
import { HTTP_URL } from "be-common/config"
import { toast } from "sonner"
import { Form, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"



const CreateRoom = () => {
    const router = useRouter()
    console.log(HTTP_URL)
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false)


    const form = useForm<{ name: string }>()
    const onSubmit = async (data: {name:string}) => {

        setIsSubmitting(true);
        try {
            const response = await axios.post(`${HTTP_URL}/create-room`,
                data,
                {
                    headers:
                    {
                        Authorization:localStorage.getItem("token")
                    }
                }
            );
            const roomId = response.data.roomId
            router.push(`/rooms/${roomId}`)
        } catch (error) {
            console.log(error);
            
        }
        
        setIsSubmitting(false);
        


    }
    return (
        <div> <div className="flex justify-center items-center min-h-screen bg-neutral-950">
            <div className="w-full max-w-md p-8 space-y-8 bg-neutral-50 rounded-lg shadow-md">
                <div className="text-center">
                    <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-6 text-neutral-950">
                        Create new Chat room 
                    </h1>
                    <p className="mb-4 text-xl text-matisse-700">Enter room name to create a new chat</p>
                </div>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

                        <FormField
                            name='name'
                            control={form.control}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Room name</FormLabel>
                                    <Input {...field} name="email/username" className="rounded-lg  border-black" />

                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        
                        <Button type="submit" className='w-full bg-neutral-200 text-neutral-700 hover:bg-neutral-700 hover:text-neutral-50 shadow-neutral-600/50 drop-shadow-xl shadow-md cursor-pointer' disabled={isSubmitting}>
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Please wait
                                </>
                            ) : (
                                'Create chat room'
                            )}
                        </Button>
                    </form>
                </Form>
            </div>
        </div></div>
    )

}

export default CreateRoom