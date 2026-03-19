    async def generate_admin_insights(self, recent_transcripts: List[str]) -> Dict[str, Any]:
        """
        Generate high-level insights from recent conversations for the admin dashboard.
        """
        if not recent_transcripts:
            return {"insight": "Not enough data to generate insights yet.", "top_issues": []}

        combined_text = "\n\n---\n\n".join(recent_transcripts[:10]) # Limit to last 10 to save tokens
        
        analysis_prompt = """
        You are an expert data analyst for the UPSA School of Graduate Studies.
        Analyze the following recent conversation transcripts between students and our AI agent.
        
        Identify:
        1. The most common difficulties or confusing points students are facing right now.
        2. Provide a short, actionable recommendation (max 2 sentences) on how we can better serve them (e.g., updating a website page, clarifying a specific policy).
        
        Return the result as JSON with this structure:
        {
            "insight": "The short actionable recommendation text...",
            "top_issues": [
                {"topic": "Issue name", "count": 5}
            ]
        }
        """

        try:
            if self.provider == "anthropic":
                response = await self.anthropic_client.messages.create(
                    model="claude-3-5-sonnet-20241022",
                    max_tokens=500,
                    messages=[{"role": "user", "content": f"{analysis_prompt}\n\nTranscripts:\n{combined_text}"}]
                )
                content = response.content[0].text
            else:
                response = await self.openai_client.chat.completions.create(
                    model="gpt-4o",
                    messages=[
                        {"role": "system", "content": "You are a helpful assistant that extracts JSON."}, 
                        {"role": "user", "content": f"{analysis_prompt}\n\nTranscripts:\n{combined_text}"}
                    ],
                    response_format={"type": "json_object"}
                )
                content = response.choices[0].message.content
            
            # Simple cleanup
            if "```json" in content:
                content = content.split("```json")[1].split("```")[0].strip()
            elif "```" in content:
                content = content.split("```")[1].strip()
                
            return json.loads(content)
        except Exception as e:
            print(f"Insights Analysis Error: {e}")
            return {"insight": "Unable to generate insights at this time due to an error.", "top_issues": []}