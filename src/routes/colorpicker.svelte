<script>
import ColorPicker from '../components/colorPicker/colorPicker.svelte'
import Navbar from '../components/navbar.svelte'


</script>

<Navbar/>

<main class="container">
  <ColorPicker on:colorchange={(e) => console.log(e.detail)}/>
</main>
