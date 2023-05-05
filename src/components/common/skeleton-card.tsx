import { Card, CardTitle, CardContent, CardHeader } from "src/components/ui/card"
import { Skeleton } from "src/components/ui/skeleton"

const SkeletonCard = ({ length }: { length: number }) => {
  return (
    <div className="flex flex-col gap-4">
      {Array.from({ length }).map((_, i) => (
        <Card key={i}>
          <CardHeader>
            <CardTitle>
              <Skeleton className="h-4 w-full/2" />
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <Skeleton className="h-4 w-full/2" />
            <Skeleton className="h-4 w-full/2" />
            <Skeleton className="h-4 w-full/2" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export default SkeletonCard
