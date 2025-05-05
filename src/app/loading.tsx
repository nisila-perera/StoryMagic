import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function Loading() {
  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Skeleton for Form Card */}
        <Card className="lg:col-span-1 shadow-lg">
          <CardHeader>
             <Skeleton className="h-8 w-3/4 mx-auto mb-2" />
             <Skeleton className="h-4 w-full mx-auto" />
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-10 w-full" />
            </div>
             <div className="space-y-2">
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-10 w-full" />
            </div>
             <div className="space-y-2">
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-4 w-1/2" />
            </div>
             <div className="space-y-2">
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-10 w-full" />
            </div>
             <div className="space-y-2">
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-20 w-full" />
            </div>
             <div className="space-y-2">
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-10 w-full" />
            </div>
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>

        {/* Skeleton for Story Display Card */}
        <Card className="lg:col-span-2 flex flex-col items-center justify-center h-96 shadow-lg">
           <CardHeader>
              <Skeleton className="h-6 w-48 mx-auto" />
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center flex-1">
              <Skeleton className="h-4 w-64 mx-auto" />
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
