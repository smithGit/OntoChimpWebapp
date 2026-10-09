/* I am getting a bit confused:
Here is the convention I'm anticipating to use:
in FastAPI we have api_model_doc_key async function that does the main LLM extract
In the Frontend app services folder we have run_api_model_doc_keyConcepts.ts module
  in which the run_api_model_doc_keyConcepts function exists,
  and it posts the call to api_model_doc_keyConcepts.
This means no Vue functions call the API, instead performing this in TypeScript services module/functions.

If this sounds logical, I would then like to discuss how to wire this
together, given that they are all async functions, and the Vue functions are also async functions.
I think this is a good pattern to follow, but I want to make sure we are on the same page.

*/

/* what I /vscode did:
export async function run_api_model_doc_keyConcepts(
  model_name: string,
  doc_key: number
) {
  const model_doc_response = await fetch(`/api/model_doc_keyConcepts/${model_name}/${doc_key}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
  return model_doc_response.json();
}
  */
export async function run_api_model_doc_keyConcepts(
  modelKey: number
) {
  const response = await fetch(
    `${API_BASE_URL}/api_model_doc_keyConcepts?model_key_integer=${modelKey}`,
    { method: "POST" }
  );

  if (!response.ok) {
    throw new Error(`FastAPI returned ${response.status}`);
  }

  return await response.json();
}
