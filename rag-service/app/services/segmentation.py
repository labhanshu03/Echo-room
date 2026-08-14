import json
from app.services.llm import generate_summary


async def segment_chunk_entries(entries):
    if len(entries) <= 1:
        return [entries]

    numbered_lines = "\n".join(
        f"[{i}] [{entry['senderId']}]: {entry['text']}" for i, entry in enumerate(entries)
    )

    prompt = f"""Below are messages from a conversation, each with an index number.

Group them by distinct topic or subject being discussed. A message that
continues, replies to, or is directly about the same subject as an earlier
message belongs in the same group as that message. Most short back-and-forth
conversations are about ONE subject — only split into multiple groups when
the messages clearly cover unrelated topics.

Messages:
{numbered_lines}

Return ONLY valid JSON, no other text, in this exact format:
{{"groups": [[0, 1], [2]]}}
"""

    raw_response = await generate_summary(prompt)

    groups = _parse_and_validate_groups(raw_response, len(entries))
    if groups is None:
        return [entries]

    return [[entries[i] for i in group] for group in groups]


def _parse_and_validate_groups(raw_response, entry_count):
    try:
        json_start = raw_response.index("{")
        json_end = raw_response.rindex("}") + 1
        parsed = json.loads(raw_response[json_start:json_end])
        groups = parsed["groups"]

        all_indices = [i for group in groups for i in group]
        if sorted(all_indices) != list(range(entry_count)):
            return None

        return groups
    except (ValueError, KeyError, TypeError):
        return None
