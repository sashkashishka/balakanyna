import { navigate } from "@/core/router/utils.ts";

export function HomePage() {
  return (
  <div>
      Home page
      <br />
      
      <button onClick={() => navigate(`/${Math.random()}`)}>
        go to random page
      </button>
    </div>
  )
}
