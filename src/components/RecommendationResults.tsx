import { motion } from "framer-motion";
import {
  Hospital,
  Shield,
  Heart,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Activity
} from "lucide-react";
import { useState } from "react";

interface RecommendationData {

  hospitals?: any[];

  schemes?: any[];

  ngos?: any[];

  dietPlan?: string[];

  precautions?: string[];

  exercises?: string[];

  dos?: string[];

  donts?: string[];

  overallConfidence?: number;

  reasoning?: string;

  error?: string;

}

interface Props {
  data: RecommendationData;
}



const ConfidenceBadge = ({ score }: { score:number }) => {

  return (

    <span className="
    px-2 py-1
    rounded-full
    text-xs
    bg-primary/10
    text-primary
    ">

      {score}% confidence

    </span>

  );

};



const Section = ({
  icon: Icon,
  title,
  children
}: any) => {

  const [open,setOpen]=useState(true);

  return(

    <div className="
    rounded-2xl
    border
    bg-card
    shadow
    overflow-hidden
    ">

      <button
      onClick={()=>setOpen(!open)}
      className="
      w-full
      flex
      justify-between
      items-center
      p-5
      hover:bg-muted/30
      ">

        <div className="flex gap-3 items-center">

          <Icon className="w-5 h-5"/>

          <h3 className="text-lg font-semibold">

            {title}

          </h3>

        </div>

        {open ?

        <ChevronUp className="w-5 h-5"/>

        :

        <ChevronDown className="w-5 h-5"/>

        }

      </button>


      {open &&

      <div className="p-5 space-y-3">

        {children}

      </div>

      }

    </div>

  );

};



const RecommendationResults = ({data}:Props)=>{


if(data?.error){

return(

<div className="p-6 text-center">

{data.error}

</div>

);

}



return(

<motion.div

initial={{opacity:0,y:20}}

animate={{opacity:1,y:0}}

className="space-y-6 max-w-4xl mx-auto"

>


{/* Overall Confidence */}

{data.overallConfidence && (

<div className="text-center">

<div className="
inline-block
px-6 py-3
rounded-xl
bg-card
border
">

Overall Confidence:

<strong className="ml-2">

{data.overallConfidence}%

</strong>

</div>

</div>

)}



{/* Hospitals */}

{data.hospitals?.length>0 &&(

<Section

icon={Hospital}

title="Recommended Hospitals"

>

{data.hospitals.map((h,i)=>(

<div
key={i}
className="
p-4
border
rounded-xl
bg-muted/20
">

<div className="
flex
justify-between
mb-2
">

<h4 className="font-semibold">

{h.name}

</h4>

<ConfidenceBadge score={h.confidence}/>

</div>


<div className="text-sm text-muted-foreground">

📍 {h.location}

</div>


<div className="text-sm">

{h.suitability}

</div>

</div>

))}

</Section>

)}



{/* Schemes */}

{data.schemes?.length>0 &&(

<Section

icon={Shield}

title="Government Schemes"

>

{data.schemes.map((s,i)=>(

<div
key={i}
className="
p-4
border
rounded-xl
bg-muted/20
">

<div className="
flex
justify-between
mb-2
">

<h4 className="font-semibold">

{s.name}

</h4>

<ConfidenceBadge score={s.confidence}/>

</div>


<div className="text-sm">

Benefits:

{s.benefits}

</div>


<div className="text-sm text-muted-foreground">

Eligibility:

{s.eligibility}

</div>

</div>

))}

</Section>

)}



{/* NGOs */}

{data.ngos?.length>0 &&(

<Section

icon={Heart}

title="NGO Support (ASHA Workers)"

>

{data.ngos.map((n,i)=>(

<div
key={i}
className="
p-4
border
rounded-xl
bg-muted/20
">

<div className="
flex
justify-between
mb-2
">

<h4 className="font-semibold">

{n.name}

</h4>

<ConfidenceBadge score={n.confidence}/>

</div>


<div className="text-sm">

Support:

{n.supportType}

</div>


<div className="text-sm text-muted-foreground">

Contact:

{n.contact}

</div>

</div>

))}

</Section>

)}



{/* Diet */}

{data.dietPlan?.length>0 &&(

<Section

icon={Heart}

title="Pregnancy Diet"

>

{data.dietPlan.map((d,i)=>(

<div
key={i}
className="
p-3
rounded-lg
border
bg-muted/20
">

• {d}

</div>

))}

</Section>

)}



{/* Precautions */}

{data.precautions?.length>0 &&(

<Section

icon={AlertCircle}

title="Precautions"

>

{data.precautions.map((d,i)=>(

<div
key={i}
className="
p-3
rounded-lg
border
bg-muted/20
">

• {d}

</div>

))}

</Section>

)}



{/* Exercises */}

{data.exercises?.length>0 &&(

<Section

icon={Activity}

title="Safe Exercises"

>

{data.exercises.map((d,i)=>(

<div
key={i}
className="
p-3
rounded-lg
border
bg-muted/20
">

• {d}

</div>

))}

</Section>

)}



{/* Do's */}

{data.dos?.length>0 &&(

<Section

icon={Shield}

title="Do's"

>

{data.dos.map((d,i)=>(

<div
key={i}
className="
p-3
rounded-lg
border
bg-muted/20
">

• {d}

</div>

))}

</Section>

)}



{/* Don'ts */}

{data.donts?.length>0 &&(

<Section

icon={AlertCircle}

title="Don'ts"

>

{data.donts.map((d,i)=>(

<div
key={i}
className="
p-3
rounded-lg
border
bg-muted/20
">

• {d}

</div>

))}

</Section>

)}



{/* AI Reasoning */}

{data.reasoning &&(

<div className="
p-5
border
rounded-xl
bg-muted/10
">

<h4 className="font-semibold mb-2">

AI Reasoning

</h4>

<p className="text-sm text-muted-foreground">

{data.reasoning}

</p>

</div>

)}



</motion.div>

);

};

export default RecommendationResults;