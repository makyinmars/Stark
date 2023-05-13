import Image from "next/image";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";

interface PreviewCardProps {
  title: string;
  description: string;
  src: string;
}

const PreviewCard = ({ title, description, src }: PreviewCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription className="">{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Image src={src} width={700} height={700} alt={title} />
      </CardContent>
    </Card>
  );
};

export default PreviewCard;
