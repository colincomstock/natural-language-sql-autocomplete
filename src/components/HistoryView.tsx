import type { HistoryItem } from "../types";
import { GalleryVerticalEnd, ChevronUp, ChevronDown, History } from "lucide-react";

interface HistoryViewProps {
    history: HistoryItem[];
    isExpanded: boolean;
    toggle: () => void;
}

export default function HistoryView({ history, isExpanded, toggle }: HistoryViewProps) {
    return(
        <div className='expander-container'>
            <div className='expander-header'>
                <div className='expander-header-title'>
                    <GalleryVerticalEnd />
                    <p>History</p>
                </div>
                <button className='expander' onClick={toggle}>
                    {isExpanded ? <ChevronUp /> : <ChevronDown />}
                </button>
            </div>
            <div className={`expander-content ${isExpanded ? 'expanded' : ''}`}>
                <div className='code-holder'>
                    {history.length === 0 ? (
                        <p>no query history</p>
                    ) : (history.map((record) => (
                    <>	
                        <div key={record.id} className='history-item'>
                            {record.selectedIndex !== undefined && (
                                <>
                                    <History />
                                    <div className='suggestion-content'>
                                        <p>{record.suggestions[record.selectedIndex].description}</p>
                                        <p><code>{record.suggestions[record.selectedIndex].sqlQuery}</code></p>
                                    </div>
                                </>
                            )}
                        </div>
                        <hr />
                    </>
                    ))
                )}
                </div>
            </div>
        </div>
    )
}