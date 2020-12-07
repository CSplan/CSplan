<script>
import ColorPicker from '../components/colorPicker/colorPicker.svelte'
import Sample from '../components/colorPicker/sample.svelte'
import Navbar from '../components/navbar.svelte'

let hex = ''
</script>

<Navbar/>

<main class="container">
  <ColorPicker on:colorchange={(e) => hex = e.detail}/>
</main>

<Sample {hex}></Sample>