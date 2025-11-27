import { Table, ChevronUp, ChevronDown } from "lucide-react";
import type { HistoryItem } from "../types";

interface TableViewProps {
    history: HistoryItem[];
    historyIsExpanded: boolean;
    tableIsExpanded: boolean;
    toggle: () => void;
}

export default function HistoryView({ history, historyIsExpanded, tableIsExpanded, toggle }: TableViewProps) {
    return (
        <div className='expander-container'>
            <div className='expander-header'>
                <div className='expander-header-title'>
                    <Table />
                    <p>Query: {history[history.length - 1]
                        .suggestions[history[history.length - 1]
                        .selectedIndex ?? 0]
                        .description
                        .replace('(expanding on previous) ', '')
                        .replace('(new query)', '')
                    }</p>
                </div>
                <button className='expander' onClick={toggle}>
                    {historyIsExpanded ? <ChevronUp /> : <ChevronDown />}
                </button>
            </div>
            <div className={`expander-content ${tableIsExpanded ? 'expanded' : ''}`}>
                <div className='code-holder'>
                    {history.length === 0 ? (
                        <p>please perform a query to view a table</p>
                    ) : <p>table placeholder for last performed query</p> 
                    
                    }
                </div>
            </div>
        </div>
    )
}