import { Card, CardContent, CardFooter, CardHeader } from './ui/card';

export default function ProductSkeleton() {
  return (
    <Card className="bg-white border-black/5 overflow-hidden rounded-3xl h-full flex flex-col animate-pulse">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start mb-2">
          <div className="h-4 w-12 bg-black/5 rounded-full" />
          <div className="h-3 w-16 bg-black/5 rounded-full" />
        </div>
        <div className="h-6 w-3/4 bg-black/5 rounded-lg mt-2" />
        <div className="h-6 w-1/2 bg-black/5 rounded-lg mt-1" />
      </CardHeader>
      <CardContent className="space-y-4 flex-1">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="h-2 w-10 bg-black/5 rounded" />
            <div className="h-4 w-16 bg-black/5 rounded" />
          </div>
          <div className="space-y-2">
            <div className="h-2 w-10 bg-black/5 rounded" />
            <div className="h-4 w-16 bg-black/5 rounded" />
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex gap-2 pt-2">
        <div className="h-10 flex-1 bg-black/5 rounded-xl" />
        <div className="h-10 flex-1 bg-black/5 rounded-xl" />
      </CardFooter>
    </Card>
  );
}
