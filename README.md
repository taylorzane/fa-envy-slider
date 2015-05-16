# Custom Slider Elements for Famous-Angular

Using these elements will allow one to create a simple slider for use with AngularJS 1.x and Famo.us.

There is a simple example in `index.html`.

A simple slider is constructed as follows:

```html
<envy-slider ng-model="some_value">
  <envy-thumb fa-translate="[20,28,0]" fa-z-index="1" fa-size="[40,40]" fa-drag="[200,0]">
    <svg width='40' height='40'>
      <circle r='10' cx='20' cy='20' fill='white'/>
    </svg>
  </envy-thumb>
  <envy-track fa-translate="[40,46,0]" fa-size="[200,4]" fa-background-color="'silver'"/>
  <envy-track-fill fa-translate="[40,46,0]" fa-size="[200,4]" fa-background-color="'#F9CD50'"/>
</envy-slider>
```

##Available Elements

Element               | Description
--------------------- | -----------
`<envy-slider>`       | This is the wrapper for the slider. Binding to a model is done here.
`<envy-thumb>`        | This is the piece of the slider that will be dragged. Its location will be bound to the model.
`<envy-track>`        | This is the backdrop of the track. Its appearance does not change with
`<envy-track-fill>`   | This is the foreground of the track. Its "fill" will be bound to the model.

##Supported Attributes

Element             | Attributes
------------------- | -----------
`<envy-slider>`     | `ng-model`
`<envy-thumb>`      | `fa-drag`, `fa-translate`, `fa-background-color`, `fa-margin`, `fa-padding`, `fa-color`, `fa-pointer-events`, `fa-z-index`
`<envy-track>`      | `fa-translate`, `fa-background-color`, `fa-margin`, `fa-padding`, `fa-color`, `fa-pointer-events`, `fa-z-index`
`<envy-track-fill>` | `fa-translate`, `fa-background-color`, `fa-margin`, `fa-padding`, `fa-color`, `fa-pointer-events`, `fa-z-index`

## Using `fa-drag`
`fa-drag` is used to set the boundaries of where `envy-thumb` can be dragged.

This markup would allow the thumb to be dragged 100 pixels horizontally-right from the starting point.
```html
<envy-thumb fa-drag="[100,0]">
  <some-markup-here>
  </some-markup-here>
</envy-thumb>
```
This markup would allow the thumb to be dragged 250 pixels vertically-down from the starting point (This is still a WIP).
```html
<envy-thumb fa-drag="[0,250]">
  <some-markup-here>
  </some-markup-here>
</envy-thumb>
```

## Installation
Currently the only way to use the sliders are to manually include the files in your project.

## Dependencies
- famous-angular

## TODO
- [ ] `<envy-track>` and `<envy-track-fill>` have unexpected behavior when providing actual markup for the surface content. Any markup should be able to be used for the tracks.
- [ ] Vertical sliders exhibit unexpected behavior.
- [ ] Create easier way to include sliders in project.

## Contributing
Any contributions are welcome. I will provide a better outline on how to contribute. Feel free to submit a pull request.

## Support
Direct all support questions to Github Issues so that all may answer, and view previous questions.

For any other questions, tweet me [@thetaylorzane](https://twitter.com/thetaylorzane) or message me on Gitter.
