import asyncio
import json
import sys
import os

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.services.retrieval import retrieve_relevant_chunks

TEST_CASES_PATH = os.path.join(os.path.dirname(__file__), "test_cases.json")


async def run_test_case(case):
    qualifying_topics, top_chunks = await retrieve_relevant_chunks(
        case["conversationKey"], case["question"]
    )

    found_topic_ids = {str(topic["_id"]) for topic in qualifying_topics}
    expected_topic_ids = case["expectedTopicIds"]

    if len(expected_topic_ids) == 0:
        # negative case — correct behavior is finding nothing relevant
        passed = len(found_topic_ids) == 0
    else:
        # positive case — correct if AT LEAST ONE expected topic was found
        passed = any(topic_id in found_topic_ids for topic_id in expected_topic_ids)

    return {
        "question": case["question"],
        "expectedTopicIds": expected_topic_ids,
        "foundTopicIds": list(found_topic_ids),
        "chunksReturned": len(top_chunks),
        "passed": passed
    }


async def main():
    with open(TEST_CASES_PATH) as f:
        test_cases = json.load(f)

    results = []
    for case in test_cases:
        result = await run_test_case(case)
        results.append(result)

        status = "PASS" if result["passed"] else "FAIL"
        print(f"[{status}] {result['question']}")
        if not result["passed"]:
            print(f"       expected one of: {result['expectedTopicIds']}")
            print(f"       found topics:    {result['foundTopicIds']}")

    passed_count = sum(1 for r in results if r["passed"])
    total_count = len(results)
    print(f"\n{passed_count}/{total_count} test cases passed")


if __name__ == "__main__":
    asyncio.run(main())
