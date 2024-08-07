import './index.css'
import TimePicker from '../src/main.js'

const focusPicker = new TimePicker('#focus-trigger')
const triggerPicker = new TimePicker('#click-trigger')
const triggerInput = document.getElementById('click-trigger-input') as HTMLInputElement

// @ts-ignore
triggerPicker.picker.container.element.classList.add('click-trigger-container-class')
// @ts-ignore
focusPicker.picker.container.element.classList.add('focus-trigger-container-class')

const testingPurposes = {
    picker: triggerPicker,
    eventsCalled: [] as string[],
    chosen: { hour: '', minute: '' },
}

window.testingPurposes = testingPurposes

triggerPicker.on('open', (evt) => {
    testingPurposes.eventsCalled.push('open')
    console.log('triggerPicker open', { evt })
})
triggerPicker.on('close', (evt) => {
    testingPurposes.eventsCalled.push('close')
    console.log('triggerPicker close', { evt })
})

triggerPicker.on('change', (evt) => {
    console.log('triggerPicker change', { evt })

    testingPurposes.eventsCalled.push('change')
    testingPurposes.chosen.hour = evt.hour
    testingPurposes.chosen.minute = evt.minute

    triggerInput.value = `${evt.hour || '00'}:${evt.minute || '00'}`
})

focusPicker.on('change', (evt) => {
    console.log('focusPicker change', { evt })

    if (evt.element instanceof HTMLInputElement) {
        evt.element.value = `${evt.hour || '00'}:${evt.minute || '00'}`
    }
})

focusPicker.on('open', (evt) => {
    console.log('focusPicker open', { evt })
})
focusPicker.on('close', (evt) => {
    console.log('focusPicker close', { evt })
})
