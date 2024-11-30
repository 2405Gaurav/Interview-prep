import { motion } from "framer-motion";
import {
    ThumbsUp,
    ThumbsDown,
    Lightbulb,
    MessageSquare,
    Star,
} from "lucide-react";

export const QuestionCard = ({ question, rating, review, index }) => {
    // console.log("Review: ", review, index);
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-gray-800 rounded-lg p-6 shadow-lg mb-4"
        >
            <div className="space-y-4">
                {/* Question Header */}
                <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                        <MessageSquare className="w-6 h-6 text-blue-400 mt-1" />
                        <h3 className="text-lg font-semibold text-white">
                            {question}
                        </h3>
                    </div>
                    <div className="flex items-center gap-2 bg-gray-700 px-3 py-1 rounded-full">
                        <Star className="w-4 h-4 text-yellow-400" />
                        <span className="text-yellow-400 font-medium">
                            {rating}
                        </span>
                    </div>
                </div>

                {/* Review Details */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                    <div className="bg-gray-700/50 p-4 rounded-lg max-h-60 overflow-y-auto">
                        <div className="flex items-center gap-2">
                            <ThumbsUp className="w-5 h-5 text-green-400" />
                            <h4 className="text-lg font-semibold text-green-400">
                                Positive Points
                            </h4>
                        </div>
                        <ul className="space-y-2 text-green-300 text-sm">
                            {review.positive?.map((point, idx) => (
                                <li
                                    key={idx}
                                    className="flex items-start gap-2"
                                >
                                    <span>{point}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="bg-gray-700/50 p-4 rounded-lg max-h-60 overflow-y-auto">
                        <div className="flex items-center gap-2">
                            <ThumbsDown className="w-5 h-5 text-red-400" />
                            <h4 className="text-lg font-semibold text-red-400">
                                Areas for Improvement
                            </h4>
                        </div>
                        <ul className="space-y-2 text-red-300 text-sm">
                            {review.negative?.map((point, idx) => (
                                <li
                                    key={idx}
                                    className="flex items-start gap-2"
                                >
                                    <span>{point}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="bg-gray-700/50 p-4 rounded-lg max-h-60 overflow-y-auto">
                        <div className="flex items-center gap-2">
                            <Lightbulb className="w-5 h-5 text-yellow-400" />
                            <h4 className="text-lg font-semibold text-yellow-400">
                                Suggested Improvements
                            </h4>
                        </div>
                        <ul className="space-y-2 text-yellow-300 text-sm">
                            {review.improvements?.map((point, idx) => (
                                <li
                                    key={idx}
                                    className="flex items-start gap-2"
                                >
                                    <span>{point}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};
