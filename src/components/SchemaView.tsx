import { Grid2X2Check, ChevronDown, ChevronUp } from "lucide-react";


interface SchemaViewProps {
    schemaDescription: string;
    isExpanded: boolean;
    toggle: () => void;
}

export default function SchemaView({ schemaDescription, isExpanded, toggle }: SchemaViewProps) {
    return(
        <div className='expander-container'>
					<div className='expander-header'>
						<div className='expander-header-title'>
							<Grid2X2Check />
							<p>Connected Table: events</p>
						</div>
						<button className='expander' onClick={toggle}>
							{isExpanded ? <ChevronUp /> : <ChevronDown />}
						</button>
					</div>
					<div className={`expander-content ${isExpanded ? 'expanded' : ''}`}>
						<div className='code-holder'>
							<span>
								<code>{schemaDescription}</code>
							</span>
						</div>
					</div>
				</div>
    )
}