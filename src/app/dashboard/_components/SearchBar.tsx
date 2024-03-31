import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"

import { Input } from "@/components/ui/input"
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, SearchIcon } from "lucide-react"
import React, { Dispatch } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

const formSchema = z.object({
    query: z.string().min(0).max(200),
})


const SearchBar = ({ query, setQuery }: {
    query: string,
    setQuery: Dispatch<React.SetStateAction<string>>
}) => {


    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            query: "",
        },
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setQuery(values.query)
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex gap-2 items-center">
                <FormField
                    control={form.control}
                    // Type 'Control<{ query: string; }, any>' is not assignable to type 'Control<FieldValues>'.
                    name="query"
                    render={({ field }) => (
                        <FormItem>
                            <FormControl>
                                <Input placeholder="Search for files.." {...field} />
                            </FormControl>

                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button type="submit"
                    disabled={form.formState.isSubmitting}
                    className="flex gap-1"
                >
                    {form.formState.isSubmitting && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    <SearchIcon />Search</Button>
            </form>
        </Form>
    )
}

export default SearchBar