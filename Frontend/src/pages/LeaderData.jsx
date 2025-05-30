import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";
import { Award, Users, User, Globe } from "lucide-react";

// Mock data for demonstration
const mockLeaderboardData = [
	{ id: 1, name: "Sarah Johnson", score: 98, avatar: "SJ" },
	{ id: 2, name: "Michael Chen", score: 95, avatar: "MC" },
	{ id: 3, name: "David Kim", score: 92, avatar: "DK" },
	{ id: 4, name: "Emma Wilson", score: 88, avatar: "EW" },
	{ id: 5, name: "Current User", score: 86, avatar: "ME", isCurrentUser: true },

];

export default function LeaderData({ currentScore, currentPosition, totalParticipants }) {
	const [filter, setFilter] = useState("global");

	// Get title and icon based on filter
	const getFilterInfo = () => {
		switch (filter) {
			case "friends":
				return { title: "Friends Leaderboard", icon: User };
			case "room":
				return { title: "Study Room Leaderboard", icon: Users };
			default:
				return { title: "Global Leaderboard", icon: Globe };
		}
	};

	const { title, icon: FilterIcon } = getFilterInfo();

	return (
		<Card className="h-full shadow-sm">
			<CardHeader className="pb-3">
				<CardTitle className="text-lg font-medium flex items-center gap-2 text-gray-800">
					<Award className="h-5 w-5 text-amber-500" />
					<span>{title}</span>
				</CardTitle>

				<div className="flex gap-1 mt-2">
					<Button
						size="sm"
						variant={filter === "global" ? "secondary" : "outline"}
						className="flex-1 text-xs h-8"
						onClick={() => setFilter("global")}
					>
						Global
					</Button>
					<Button
						size="sm"
						variant={filter === "friends" ? "secondary" : "outline"}
						className="flex-1 text-xs h-8"
						onClick={() => setFilter("friends")}
					>
						Friends
					</Button>
					<Button
						size="sm"
						variant={filter === "room" ? "secondary" : "outline"}
						className="flex-1 text-xs h-8"
						onClick={() => setFilter("room")}
					>
						Room
					</Button>
				</div>
			</CardHeader>
			<CardContent className="pb-4">
				<div className="text-center mb-4">
					<p className="text-sm text-gray-500">Your Position</p>
					<div className="flex items-center justify-center gap-1">
						<span className="text-xl font-bold text-gray-800">
							#{currentPosition}
						</span>
						<span className="text-gray-500 text-sm">
							of {totalParticipants}
						</span>
					</div>
					<div className="flex items-center justify-center gap-1 mt-1">
						<span className="text-sm text-gray-600">Score:</span>
						<span className="text-sm font-medium text-cyan-600">
							{Math.round(currentScore)}
						</span>
					</div>
				</div>

				<div className="space-y-2 mt-4">
					{mockLeaderboardData.map((entry, index) => (
						<div
							key={entry.id}
							className={`flex items-center p-2 rounded-lg ${
								entry.isCurrentUser
									? "bg-indigo-50 border border-indigo-100"
									: "hover:bg-gray-50"
							}`}
						>
							<div className="w-7 font-medium text-center text-gray-700">
								{index + 1}
							</div>
							<div
								className={`w-8 h-8 rounded-full flex items-center justify-center mr-2 ${
									index < 3
										? [
												"bg-amber-100 text-amber-600 border border-amber-200",
												"bg-gray-100 text-gray-600 border border-gray-200",
												"bg-amber-50 text-amber-700 border border-amber-100",
										  ][index]
										: "bg-gray-100 text-gray-600 border border-gray-200"
								}`}
							>
								{entry.avatar}
							</div>
							<div className="flex-1 flex items-center">
								<span
									className={`truncate text-gray-800 ${
										entry.isCurrentUser ? "font-medium" : ""
									}`}
								>
									{entry.name}
								</span>
							</div>
							<div className="font-medium text-gray-800">{entry.score}</div>
						</div>
					))}
				</div>
			</CardContent>
		</Card>
	);
}